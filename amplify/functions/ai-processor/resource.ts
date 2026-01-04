import { defineFunction, secret } from '@aws-amplify/backend';

export const aiProcessorFunction = defineFunction({
  name: 'ai-processor',
  entry: './handler.ts',
  timeoutSeconds: 120,
  memoryMB: 256,
  environment: {
    FEED_ITEM_TABLE_NAME: '',
    STORY_GROUP_TABLE_NAME: '',
    OWNER_ID: 'default-owner',
    // OpenAI API key stored as a secret
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
  },
});
