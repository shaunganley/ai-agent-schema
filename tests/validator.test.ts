/**
 * Tests for validator utilities
 */
import { describe, it, expect } from 'vitest';
import {
  validateAgentConfig,
  validateAgentConfigStrict,
  validatePartialAgentConfig,
} from '../src/utils/validator';
import type { AgentConfig } from '../src/types/agent';

describe('validateAgentConfig', () => {
  it('should validate a minimal valid config', () => {
    const config = {
      id: 'agent1',
      name: 'Test Agent',
      provider: 'openai',
      model: 'gpt-4',
    };

    const result = validateAgentConfig(config);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(config);
  });

  it('should validate a complete valid config', () => {
    const config: AgentConfig = {
      id: 'agent1',
      name: 'Research Agent',
      description: 'An agent for research tasks',
      provider: 'openai',
      model: 'gpt-4',
      systemPrompt: 'You are a helpful research assistant',
      parameters: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
      },
      tools: [
        {
          id: 'search',
          name: 'Web Search',
          description: 'Search the web for information',
        },
      ],
      memory: {
        type: 'buffer',
        maxMessages: 10,
      },
      connections: ['agent2'],
      metadata: {
        version: '1.0',
      },
    };

    const result = validateAgentConfig(config);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(config);
  });

  it('should fail validation for missing required fields', () => {
    const config = {
      name: 'Test Agent',
    };

    const result = validateAgentConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues).toBeDefined();
    expect(result.error?.issues?.length).toBeGreaterThan(0);
  });

  it('should fail validation for invalid provider', () => {
    const config = {
      id: 'agent1',
      name: 'Test Agent',
      provider: 'invalid-provider',
      model: 'gpt-4',
    };

    const result = validateAgentConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail validation for invalid temperature', () => {
    const config = {
      id: 'agent1',
      name: 'Test Agent',
      provider: 'openai',
      model: 'gpt-4',
      parameters: {
        temperature: 3.0, // Out of range
      },
    };

    const result = validateAgentConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should validate different providers', () => {
    const providers = [
      'openai',
      'anthropic',
      'google',
      'mistral',
      'cohere',
      'azure-openai',
      'bedrock',
      'custom',
    ];

    providers.forEach((provider) => {
      const config = {
        id: 'agent1',
        name: 'Test Agent',
        provider,
        model: 'test-model',
      };

      const result = validateAgentConfig(config);
      expect(result.success).toBe(true);
    });
  });
});

describe('validateAgentConfigStrict', () => {
  it('should return validated config on success', () => {
    const config = {
      id: 'agent1',
      name: 'Test Agent',
      provider: 'openai',
      model: 'gpt-4',
    };

    const validated = validateAgentConfigStrict(config);
    expect(validated).toEqual(config);
  });

  it('should throw on validation failure', () => {
    const config = {
      name: 'Test Agent',
    };

    expect(() => validateAgentConfigStrict(config)).toThrow();
  });
});

describe('validatePartialAgentConfig', () => {
  it('should validate a partial config', () => {
    const partial = {
      name: 'Updated Name',
      parameters: {
        temperature: 0.5,
      },
    };

    const result = validatePartialAgentConfig(partial);
    expect(result.success).toBe(true);
  });

  it('should fail for invalid partial config', () => {
    const partial = {
      parameters: {
        temperature: 5.0, // Invalid
      },
    };

    const result = validatePartialAgentConfig(partial);
    expect(result.success).toBe(false);
  });
});
