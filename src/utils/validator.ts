/**
 * Validation utilities for AI Agent configurations
 */
import { ZodError } from 'zod';
import { AgentConfigSchema } from '../schemas/agent.schema.js';
import type { AgentConfig } from '../types/agent.js';
import type { ValidationResult } from '../types/agent.js';

/**
 * Validates an agent configuration against the schema
 *
 * @param config - The agent configuration to validate
 * @returns Validation result with success status and data or error
 *
 * @example
 * ```ts
 * const result = validateAgentConfig({
 *   id: 'agent1',
 *   name: 'Research Agent',
 *   provider: 'openai',
 *   model: 'gpt-4'
 * });
 *
 * if (result.success) {
 *   console.log('Valid config:', result.data);
 * } else {
 *   console.error('Validation failed:', result.error);
 * }
 * ```
 */
export function validateAgentConfig(config: unknown): ValidationResult {
  try {
    const validatedData = AgentConfigSchema.parse(config);
    return {
      success: true,
      data: validatedData as AgentConfig,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          message: 'Validation failed',
          issues: error.errors.map((issue) => ({
            path: issue.path.map(String),
            message: issue.message,
          })),
        },
      };
    }
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Unknown validation error',
      },
    };
  }
}

/**
 * Validates an agent configuration and throws on failure
 *
 * @param config - The agent configuration to validate
 * @returns The validated agent configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```ts
 * try {
 *   const agent = validateAgentConfigStrict({
 *     id: 'agent1',
 *     name: 'Research Agent',
 *     provider: 'openai',
 *     model: 'gpt-4'
 *   });
 *   // Use agent...
 * } catch (error) {
 *   console.error('Invalid config:', error);
 * }
 * ```
 */
export function validateAgentConfigStrict(config: unknown): AgentConfig {
  return AgentConfigSchema.parse(config) as AgentConfig;
}

/**
 * Validates a partial agent configuration (useful for updates)
 *
 * @param config - The partial agent configuration to validate
 * @returns Validation result with success status and data or error
 *
 * @example
 * ```ts
 * const result = validatePartialAgentConfig({
 *   temperature: 0.7,
 *   maxTokens: 1000
 * });
 * ```
 */
export function validatePartialAgentConfig(
  config: unknown
): Omit<ValidationResult, 'data'> & { data?: Partial<AgentConfig> } {
  try {
    const validatedData = AgentConfigSchema.partial().parse(config);
    return {
      success: true,
      data: validatedData as Partial<AgentConfig>,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          message: 'Validation failed',
          issues: error.errors.map((issue) => ({
            path: issue.path.map(String),
            message: issue.message,
          })),
        },
      };
    }
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Unknown validation error',
      },
    };
  }
}
