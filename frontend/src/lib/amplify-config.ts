import { Amplify } from 'aws-amplify';

// Store custom outputs for access by other parts of the app
let customConfig: { feedPreviewUrl?: string } = {};

/**
 * Get custom configuration values from amplify_outputs.json
 */
export function getCustomConfig() {
  return customConfig;
}

/**
 * Configure Amplify with the outputs from the backend deployment.
 *
 * For local development: Run `npm run sandbox` to generate amplify_outputs.json
 * For production: Amplify Hosting automatically generates this file during deployment
 */
export async function configureAmplify(): Promise<void> {
  try {
    const response = await fetch('/amplify_outputs.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const outputs = await response.json();
    Amplify.configure(outputs);

    // Store custom outputs for later access
    if (outputs.custom) {
      customConfig = outputs.custom;
    }

    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Failed to configure Amplify:', error);
    throw new Error(
      'Failed to load Amplify configuration. Run `npm run sandbox` to generate amplify_outputs.json for local development.'
    );
  }
}
