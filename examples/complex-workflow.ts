/**
 * Example: Complex Multi-Agent Workflow
 *
 * This example demonstrates a more complex workflow with parallel execution,
 * conditional routing, and inline agent configurations.
 */

import {
  validateWorkflowConfig,
  detectWorkflowCycles,
  getWorkflowTopologicalOrder,
  type WorkflowConfig,
} from '../src/index.js';

// Define a complex content creation workflow
const contentCreationWorkflow: WorkflowConfig = {
  id: 'content-creation-workflow',
  name: 'AI Content Creation Pipeline',
  description:
    'A comprehensive workflow for creating, reviewing, and publishing content',
  version: '2.0.0',
  nodes: [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 100, y: 300 },
    },
    {
      id: 'research-agent',
      type: 'agent',
      agent: {
        id: 'research-1',
        name: 'Research Agent',
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'You are a research assistant. Research the given topic.',
        parameters: {
          temperature: 0.7,
          maxTokens: 2000,
        },
      },
      position: { x: 300, y: 300 },
    },
    {
      id: 'writer-agent',
      type: 'agent',
      agent: {
        id: 'writer-1',
        name: 'Content Writer',
        provider: 'anthropic',
        model: 'claude-3-opus',
        systemPrompt: 'You are a professional content writer.',
        parameters: {
          temperature: 0.8,
          maxTokens: 4000,
        },
      },
      position: { x: 500, y: 200 },
    },
    {
      id: 'seo-agent',
      type: 'agent',
      agent: {
        id: 'seo-1',
        name: 'SEO Optimizer',
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'You are an SEO expert. Optimize content for search.',
        parameters: {
          temperature: 0.5,
          maxTokens: 1000,
        },
      },
      position: { x: 500, y: 400 },
    },
    {
      id: 'quality-check',
      type: 'condition',
      position: { x: 700, y: 300 },
      metadata: {
        condition: 'quality_score > 8',
      },
    },
    {
      id: 'editor-agent',
      type: 'agent',
      agent: {
        id: 'editor-1',
        name: 'Editor Agent',
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        systemPrompt: 'You are an editor. Review and improve content.',
        parameters: {
          temperature: 0.6,
          maxTokens: 3000,
        },
      },
      position: { x: 700, y: 100 },
    },
    {
      id: 'publish',
      type: 'end',
      position: { x: 900, y: 300 },
    },
  ],
  connections: [
    {
      id: 'conn-1',
      sourceId: 'trigger',
      targetId: 'research-agent',
      label: 'Start',
    },
    {
      id: 'conn-2',
      sourceId: 'research-agent',
      targetId: 'writer-agent',
      label: 'Research Data',
    },
    {
      id: 'conn-3',
      sourceId: 'research-agent',
      targetId: 'seo-agent',
      label: 'SEO Keywords',
    },
    {
      id: 'conn-4',
      sourceId: 'writer-agent',
      targetId: 'quality-check',
      label: 'Draft Content',
    },
    {
      id: 'conn-5',
      sourceId: 'seo-agent',
      targetId: 'quality-check',
      label: 'SEO Metadata',
    },
    {
      id: 'conn-6',
      sourceId: 'quality-check',
      targetId: 'publish',
      label: 'High Quality',
      condition: 'quality_score > 8',
    },
    {
      id: 'conn-7',
      sourceId: 'quality-check',
      targetId: 'editor-agent',
      label: 'Needs Review',
      condition: 'quality_score <= 8',
    },
    {
      id: 'conn-8',
      sourceId: 'editor-agent',
      targetId: 'publish',
      label: 'Edited',
    },
  ],
  trigger: {
    type: 'webhook',
    config: {
      webhookUrl: '/api/workflows/content-creation',
    },
  },
  variables: [
    {
      name: 'topic',
      type: 'string',
      required: true,
      description: 'Content topic',
    },
    {
      name: 'target_audience',
      type: 'string',
      defaultValue: 'general',
      description: 'Target audience for the content',
    },
    {
      name: 'word_count',
      type: 'number',
      defaultValue: 1000,
      description: 'Target word count',
    },
    {
      name: 'quality_threshold',
      type: 'number',
      defaultValue: 8,
      description: 'Minimum quality score (0-10)',
    },
  ],
  tags: ['content', 'ai', 'seo', 'writing', 'production'],
  metadata: {
    author: 'Content Team',
    department: 'Marketing',
    estimatedDuration: '10-15 minutes',
  },
};

// Validate the workflow
const result = validateWorkflowConfig(contentCreationWorkflow);

if (result.success) {
  console.log('✅ Complex workflow is valid!');
  console.log('\nWorkflow Details:');
  console.log(`  ID: ${result.data?.id}`);
  console.log(`  Name: ${result.data?.name}`);
  console.log(`  Version: ${result.data?.version}`);
  console.log(`  Nodes: ${result.data?.nodes.length}`);
  console.log(`  Connections: ${result.data?.connections.length}`);

  // Check for cycles
  const hasCycles = detectWorkflowCycles(result.data!);
  console.log(`\n  Has Cycles: ${hasCycles ? '⚠️  Yes' : '✅ No'}`);

  // Get execution order
  const order = getWorkflowTopologicalOrder(result.data!);
  if (order) {
    console.log('\n  Execution Order:');
    order.forEach((nodeId, index) => {
      const node = result.data?.nodes.find((n) => n.id === nodeId);
      console.log(`    ${index + 1}. ${nodeId} (${node?.type})`);
    });
  }

  console.log('\n  Agents:');
  result.data?.nodes
    .filter((n) => n.type === 'agent')
    .forEach((node) => {
      console.log(`    - ${node.agent?.name || node.agentId}`);
      console.log(
        `      Provider: ${node.agent?.provider}, Model: ${node.agent?.model}`
      );
    });
} else {
  console.error('❌ Workflow validation failed:');
  console.error(result.error);
}

export { contentCreationWorkflow };
