/**
 * Example: Basic Agent Configuration
 * 
 * This example demonstrates how to create and validate a simple agent configuration.
 */

import { validateAgentConfig, type AgentConfig } from '../src/index.js';

// Define a basic research agent
const basicAgent: AgentConfig = {
  id: 'research-agent-1',
  name: 'Research Agent',
  description: 'A general-purpose research assistant',
  provider: 'openai',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful research assistant. Provide accurate, well-researched information.',
  parameters: {
    temperature: 0.7,
    maxTokens: 2000,
  },
};

// Validate the configuration
const result = validateAgentConfig(basicAgent);

if (result.success) {
  console.log('✅ Agent configuration is valid!');
  console.log('\nAgent Details:');
  console.log(`  ID: ${result.data?.id}`);
  console.log(`  Name: ${result.data?.name}`);
  console.log(`  Provider: ${result.data?.provider}`);
  console.log(`  Model: ${result.data?.model}`);
  console.log(`  Temperature: ${result.data?.parameters?.temperature}`);
} else {
  console.error('❌ Validation failed:');
  console.error(result.error);
}

export { basicAgent };
