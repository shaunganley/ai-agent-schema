/**
 * Utilities for generating JSON Schema from Zod schemas
 */
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AgentConfigSchema } from '../schemas/agent.schema.js';

/**
 * Generates a JSON Schema representation of the Agent configuration
 * This can be used by form generators and validation tools
 *
 * @returns JSON Schema object
 *
 * @example
 * ```ts
 * const jsonSchema = generateAgentJsonSchema();
 * // Use with a form generator like react-jsonschema-form
 * ```
 */
export function generateAgentJsonSchema() {
  return zodToJsonSchema(AgentConfigSchema, {
    name: 'AgentConfig',
    $refStrategy: 'none',
  });
}

/**
 * Generates a pretty-printed JSON Schema string
 *
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON Schema string
 *
 * @example
 * ```ts
 * const schemaString = generateAgentJsonSchemaString();
 * console.log(schemaString);
 * ```
 */
export function generateAgentJsonSchemaString(indent = 2): string {
  const schema = generateAgentJsonSchema();
  return JSON.stringify(schema, null, indent);
}
