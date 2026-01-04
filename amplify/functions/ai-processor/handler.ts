import type { Handler } from 'aws-lambda';
import { getUnprocessedItems, updateItemClassification, updateStoryGroupClassification } from './db';
import { classifyBatch, type ClassificationResult } from './openai';

const BATCH_SIZE = 10;
const MAX_ITEMS_PER_RUN = 50;

interface ProcessResult {
  itemsProcessed: number;
  itemsClassified: number;
  errors: string[];
}

export const handler: Handler = async (event): Promise<ProcessResult> => {
  console.log('AI Processor triggered:', JSON.stringify(event));

  const results: ProcessResult = {
    itemsProcessed: 0,
    itemsClassified: 0,
    errors: [],
  };

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not configured');
    results.errors.push('OPENAI_API_KEY not configured');
    return results;
  }

  try {
    // Get unprocessed items
    const items = await getUnprocessedItems(MAX_ITEMS_PER_RUN);
    console.log(`Found ${items.length} unprocessed items`);

    if (items.length === 0) {
      console.log('No items to process');
      return results;
    }

    // Process in batches
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} items)`);

      try {
        // Classify batch with OpenAI
        const classifications = await classifyBatch(batch);
        results.itemsProcessed += batch.length;

        // Update each item with classification
        for (const classification of classifications) {
          try {
            await updateItemClassification(classification);
            await updateStoryGroupClassification(classification);
            results.itemsClassified++;
          } catch (error) {
            console.error(`Failed to update item ${classification.id}:`, error);
            results.errors.push(`Update failed: ${classification.id}`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Batch classification failed:`, message);
        results.errors.push(`Batch failed: ${message}`);
      }

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI Processor failed:', message);
    results.errors.push(message);
  }

  console.log('AI Processor completed:', results);
  return results;
};
