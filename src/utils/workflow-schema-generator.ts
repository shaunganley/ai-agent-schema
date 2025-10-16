/**
 * Utilities for generating JSON Schema from Workflow schemas
 */
import { zodToJsonSchema } from 'zod-to-json-schema';
import { WorkflowConfigSchema } from '../schemas/workflow.schema.js';

/**
 * Generates a JSON Schema representation of the Workflow configuration
 * This can be used by form generators and validation tools
 *
 * @returns JSON Schema object
 *
 * @example
 * ```ts
 * const jsonSchema = generateWorkflowJsonSchema();
 * // Use with a form generator like react-jsonschema-form
 * ```
 */
export function generateWorkflowJsonSchema() {
  return zodToJsonSchema(WorkflowConfigSchema, {
    name: 'WorkflowConfig',
    $refStrategy: 'none',
  });
}

/**
 * Generates a pretty-printed JSON Schema string for Workflow
 *
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON Schema string
 *
 * @example
 * ```ts
 * const schemaString = generateWorkflowJsonSchemaString();
 * console.log(schemaString);
 * ```
 */
export function generateWorkflowJsonSchemaString(indent = 2): string {
  const schema = generateWorkflowJsonSchema();
  return JSON.stringify(schema, null, indent);
}
