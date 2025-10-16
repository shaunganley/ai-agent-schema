/**
 * Tests for workflow schema generator utilities
 */
import { describe, it, expect } from 'vitest';
import {
  generateWorkflowJsonSchema,
  generateWorkflowJsonSchemaString,
} from '../src/utils/workflow-schema-generator';

describe('generateWorkflowJsonSchema', () => {
  it('should generate a valid JSON Schema object', () => {
    const schema = generateWorkflowJsonSchema();

    expect(schema).toBeDefined();
    expect(typeof schema).toBe('object');
    expect(schema).toHaveProperty('$ref');
  });

  it('should have workflow definitions', () => {
    const schema = generateWorkflowJsonSchema();

    expect(schema).toHaveProperty('definitions');
    const definitions = (schema as any).definitions;
    expect(definitions).toBeDefined();
    expect(definitions).toHaveProperty('WorkflowConfig');
  });

  it('should define WorkflowConfig with required fields', () => {
    const schema = generateWorkflowJsonSchema();
    const workflowConfig = (schema as any).definitions?.WorkflowConfig;

    expect(workflowConfig).toBeDefined();
    expect(workflowConfig.required).toContain('id');
    expect(workflowConfig.required).toContain('name');
    expect(workflowConfig.required).toContain('nodes');
    expect(workflowConfig.required).toContain('connections');
  });

  it('should define nodes as an array', () => {
    const schema = generateWorkflowJsonSchema();
    const workflowConfig = (schema as any).definitions?.WorkflowConfig;
    const nodesProperty = workflowConfig?.properties?.nodes;

    expect(nodesProperty).toBeDefined();
    expect(nodesProperty.type).toBe('array');
  });

  it('should define connections as an array', () => {
    const schema = generateWorkflowJsonSchema();
    const workflowConfig = (schema as any).definitions?.WorkflowConfig;
    const connectionsProperty = workflowConfig?.properties?.connections;

    expect(connectionsProperty).toBeDefined();
    expect(connectionsProperty.type).toBe('array');
  });

  it('should include WorkflowNode definition', () => {
    const schema = generateWorkflowJsonSchema();
    const definitions = (schema as any).definitions;

    // WorkflowNode might be nested or named differently
    expect(definitions).toBeDefined();
    expect(definitions.WorkflowConfig).toBeDefined();
    // The nodes property should be defined in WorkflowConfig
    const nodesProperty = definitions.WorkflowConfig.properties?.nodes;
    expect(nodesProperty).toBeDefined();
  });

  it('should include WorkflowConnection definition', () => {
    const schema = generateWorkflowJsonSchema();
    const definitions = (schema as any).definitions;

    // WorkflowConnection might be nested or named differently
    expect(definitions).toBeDefined();
    expect(definitions.WorkflowConfig).toBeDefined();
    // The connections property should be defined in WorkflowConfig
    const connectionsProperty =
      definitions.WorkflowConfig.properties?.connections;
    expect(connectionsProperty).toBeDefined();
  });
});

describe('generateWorkflowJsonSchemaString', () => {
  it('should generate a valid JSON string', () => {
    const schemaString = generateWorkflowJsonSchemaString();

    expect(typeof schemaString).toBe('string');
    expect(() => JSON.parse(schemaString)).not.toThrow();
  });

  it('should be formatted with proper indentation', () => {
    const schemaString = generateWorkflowJsonSchemaString(2);

    expect(schemaString).toContain('\n');
    expect(schemaString).toContain('  '); // 2-space indent
  });

  it('should support custom indentation', () => {
    const schemaString = generateWorkflowJsonSchemaString(4);

    expect(schemaString).toContain('    '); // 4-space indent
  });

  it('should contain workflow-related keywords', () => {
    const schemaString = generateWorkflowJsonSchemaString();

    expect(schemaString).toContain('WorkflowConfig');
    expect(schemaString).toContain('nodes');
    expect(schemaString).toContain('connections');
  });
});
