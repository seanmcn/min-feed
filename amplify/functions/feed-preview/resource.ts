import { defineFunction } from '@aws-amplify/backend';

export const feedPreviewFunction = defineFunction({
  name: 'feed-preview',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
});
