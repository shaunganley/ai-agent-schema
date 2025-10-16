/**
 * Example: Agent with Tools
 * 
 * This example shows how to configure an agent with custom tools and memory.
 */

import { validateAgentConfig, type AgentConfig } from '../src/index.js';

// Define an agent with tools and memory
const agentWithTools: AgentConfig = {
  id: 'web-research-agent',
  name: 'Web Research Agent',
  description: 'An agent that can search the web and analyze results',
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',
  systemPrompt: 'You are a research assistant with access to web search. Use your tools to find accurate, current information.',
  parameters: {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
  },
  tools: [
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the web for current information',
      parameters: {
        query: {
          type: 'string',
          description: 'The search query',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 5,
        },
      },
    },
    {
      id: 'url-scraper',
      name: 'URL Scraper',
      description: 'Extract content from a specific URL',
      parameters: {
        url: {
          type: 'string',
          description: 'The URL to scrape',
        },
      },
      requiresAuth: false,
    },
  ],
  memory: {
    type: 'buffer',
    maxMessages: 20,
    persistent: false,
  },
  metadata: {
    category: 'research',
    version: '1.0.0',
    tags: ['web', 'search', 'analysis'],
  },
};

// Validate the configuration
const result = validateAgentConfig(agentWithTools);

if (result.success) {
  console.log('✅ Agent with tools is valid!');
  console.log('\nTools available:');
  result.data?.tools?.forEach((tool) => {
    console.log(`  - ${tool.name}: ${tool.description}`);
  });
  console.log(`\nMemory: ${result.data?.memory?.type} (max: ${result.data?.memory?.maxMessages} messages)`);
} else {
  console.error('❌ Validation failed:');
  console.error(result.error);
}

export { agentWithTools };
