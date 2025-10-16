/**
 * Core type definitions for AI Agent Schema
 */

/**
 * Supported AI model providers
 */
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'cohere'
  | 'azure-openai'
  | 'bedrock'
  | 'custom';

/**
 * Memory configuration for agents
 */
export interface MemoryConfig {
  /**
   * Type of memory to use
   */
  type: 'buffer' | 'summary' | 'vector' | 'none';

  /**
   * Maximum number of messages to keep in memory
   */
  maxMessages?: number;

  /**
   * Whether to persist memory between sessions
   */
  persistent?: boolean;
}

/**
 * Tool definition for agent capabilities
 */
export interface Tool {
  /**
   * Unique identifier for the tool
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of what the tool does
   */
  description: string;

  /**
   * JSON Schema for tool parameters
   */
  parameters?: Record<string, unknown>;

  /**
   * Whether this tool requires authentication
   */
  requiresAuth?: boolean;
}

/**
 * Model parameters for controlling AI behavior
 */
export interface ModelParameters {
  /**
   * Temperature (0-2) - controls randomness
   */
  temperature?: number;

  /**
   * Maximum number of tokens to generate
   */
  maxTokens?: number;

  /**
   * Top P sampling parameter
   */
  topP?: number;

  /**
   * Frequency penalty (-2 to 2)
   */
  frequencyPenalty?: number;

  /**
   * Presence penalty (-2 to 2)
   */
  presencePenalty?: number;

  /**
   * Stop sequences
   */
  stopSequences?: string[];
}

/**
 * Core Agent configuration
 */
export interface AgentConfig {
  /**
   * Unique identifier for this agent
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of the agent's purpose
   */
  description?: string;

  /**
   * AI model provider
   */
  provider: AIProvider;

  /**
   * Specific model identifier (e.g., 'gpt-4', 'claude-3-opus')
   */
  model: string;

  /**
   * System prompt or instructions for the agent
   */
  systemPrompt?: string;

  /**
   * Model parameters
   */
  parameters?: ModelParameters;

  /**
   * Tools available to this agent
   */
  tools?: Tool[];

  /**
   * Memory configuration
   */
  memory?: MemoryConfig;

  /**
   * IDs of other agents this agent connects to in a workflow
   */
  connections?: string[];

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /**
   * Whether validation passed
   */
  success: boolean;

  /**
   * Validated data (if successful)
   */
  data?: AgentConfig;

  /**
   * Error details (if failed)
   */
  error?: {
    message: string;
    issues?: Array<{
      path: string[];
      message: string;
    }>;
  };
}
