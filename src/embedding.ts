import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const region = process.env.AWS_BEDROCK_REGION || 'us-west-2';
const modelId = process.env.BEDROCK_EMBEDDING_MODEL || 'amazon.titan-embed-text-v2:0';
const dimensions = Number(process.env.BEDROCK_EMBEDDING_DIMENSIONS || '1024');

const client = new BedrockRuntimeClient({ region });

export type EmbeddingResult = {
  provider: 'amazon-bedrock';
  model: string;
  dimensions: number;
  vector: number[];
};

export async function embedText(text: string): Promise<EmbeddingResult> {
  if (!text.trim()) throw new Error('Cannot embed empty text.');
  if (dimensions !== 1024) {
    throw new Error('This judge reference implementation expects 1024-dimension Titan embeddings.');
  }

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: text,
        dimensions,
        normalize: true,
      }),
    }),
  );

  const decoded = JSON.parse(new TextDecoder().decode(response.body)) as {
    embedding?: number[];
  };
  const vector = decoded.embedding;

  if (!Array.isArray(vector) || vector.length !== dimensions) {
    throw new Error('Bedrock returned an unexpected embedding shape.');
  }

  return {
    provider: 'amazon-bedrock',
    model: modelId,
    dimensions,
    vector,
  };
}
