/**
 * Tests for schema generator utilities
 */
import { describe, it, expect } from 'vitest';
import {
  generateAgentJsonSchema,
  generateAgentJsonSchemaString,
} from '../src/utils/schema-generator';

describe('generateAgentJsonSchema', () => {
  it('should generate a valid JSON Schema object', () => {
    const schema = generateAgentJsonSchema();

    expect(schema).toBeDefined();
    expect(typeof schema).toBe('object');
    // The schema should have either a direct structure or be wrapped
    expect(schema).toHaveProperty('$ref');
  });

  it('should be parseable and have definitions', () => {
    const schema = generateAgentJsonSchema();

    // Check that it has the expected structure
    expect(schema).toHaveProperty('$ref');
    expect(schema).toHaveProperty('definitions');

    // The AgentConfig should be in definitions
    const definitions = (schema as any).definitions;
    expect(definitions).toBeDefined();
    expect(definitions).toHaveProperty('AgentConfig');
  });

  it('should define AgentConfig with required fields', () => {
    const schema = generateAgentJsonSchema();
    const agentConfig = (schema as any).definitions?.AgentConfig;

    expect(agentConfig).toBeDefined();
    expect(agentConfig.required).toContain('id');
    expect(agentConfig.required).toContain('name');
    expect(agentConfig.required).toContain('provider');
    expect(agentConfig.required).toContain('model');
  });

  it('should define provider as an enum', () => {
    const schema = generateAgentJsonSchema();
    const agentConfig = (schema as any).definitions?.AgentConfig;
    const providerProperty = agentConfig?.properties?.provider;

    expect(providerProperty).toBeDefined();
    expect(providerProperty).toHaveProperty('enum');
    expect(Array.isArray(providerProperty.enum)).toBe(true);
  });

  it('should define parameters with nested properties', () => {
    const schema = generateAgentJsonSchema();
    const agentConfig = (schema as any).definitions?.AgentConfig;
    const parametersProperty = agentConfig?.properties?.parameters;

    expect(parametersProperty).toBeDefined();
    // Parameters should have properties or be an object type
    expect(parametersProperty.type).toBe('object');
  });
});

describe('generateAgentJsonSchemaString', () => {
  it('should generate a valid JSON string', () => {
    const schemaString = generateAgentJsonSchemaString();

    expect(typeof schemaString).toBe('string');
    expect(() => JSON.parse(schemaString)).not.toThrow();
  });

  it('should be formatted with proper indentation', () => {
    const schemaString = generateAgentJsonSchemaString(2);

    expect(schemaString).toContain('\n');
    expect(schemaString).toContain('  '); // 2-space indent
  });

  it('should support custom indentation', () => {
    const schemaString = generateAgentJsonSchemaString(4);

    expect(schemaString).toContain('    '); // 4-space indent
  });
});
