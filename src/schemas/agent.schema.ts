/**
 * Zod schemas for AI Agent validation
 */
import { z } from 'zod';

/**
 * AI Provider enum schema
 */
export const AIProviderSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'mistral',
  'cohere',
  'azure-openai',
  'bedrock',
  'custom',
]);

/**
 * Memory configuration schema
 */
export const MemoryConfigSchema = z.object({
  type: z.enum(['buffer', 'summary', 'vector', 'none']),
  maxMessages: z.number().int().positive().optional(),
  persistent: z.boolean().optional(),
});

/**
 * Tool schema
 */
export const ToolSchema = z.object({
  id: z.string().min(1, 'Tool ID is required'),
  name: z.string().min(1, 'Tool name is required'),
  description: z.string(),
  parameters: z.record(z.unknown()).optional(),
  requiresAuth: z.boolean().optional(),
});

/**
 * Model parameters schema
 */
export const ModelParametersSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stopSequences: z.array(z.string()).optional(),
});

/**
 * Core Agent configuration schema
 */
export const AgentConfigSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  provider: AIProviderSchema,
  model: z.string().min(1, 'Model is required'),
  systemPrompt: z.string().optional(),
  parameters: ModelParametersSchema.optional(),
  tools: z.array(ToolSchema).optional(),
  memory: MemoryConfigSchema.optional(),
  connections: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Type inference from Zod schemas
 */
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type Tool = z.infer<typeof ToolSchema>;
export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;
export type ModelParameters = z.infer<typeof ModelParametersSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
