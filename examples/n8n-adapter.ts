/**
 * Example: Converting an agent to n8n format
 * 
 * This example shows how to convert a customer support agent
 * and workflow to n8n-compatible format for deployment.
 */

import {
  type AgentConfig,
  type WorkflowConfig,
  mapAgentToN8nNode,
  mapWorkflowToN8n,
} from '../src/index.js';

// Define a customer support agent
const supportAgent: AgentConfig = {
  id: 'support-agent',
  name: 'Customer Support Agent',
  description: 'Handles customer inquiries and support tickets',
  provider: 'openai',
  model: 'gpt-4',
  systemPrompt: `You are a helpful customer support agent.
Your role is to:
- Answer customer questions clearly and professionally
- Troubleshoot common issues
- Escalate complex problems when needed
- Maintain a friendly, patient tone`,
  parameters: {
    temperature: 0.7,
    maxTokens: 1000,
  },
  tools: [
    {
      id: 'search-kb',
      name: 'search_knowledge_base',
      description: 'Search the knowledge base for help articles',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
    {
      id: 'create-ticket',
      name: 'create_support_ticket',
      description: 'Create a support ticket for complex issues',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['title', 'description'],
      },
    },
  ],
  memory: {
    type: 'buffer',
    maxMessages: 10,
  },
};

// Convert single agent to n8n node
console.log('🔧 Converting agent to n8n node...\n');
const n8nNode = mapAgentToN8nNode(supportAgent, {
  startPosition: [250, 300],
  includeCredentials: true,
});

console.log('n8n Node:');
console.log(JSON.stringify(n8nNode, null, 2));
console.log('\n---\n');

// Define a complete support workflow
const supportWorkflow: WorkflowConfig = {
  id: 'support-workflow',
  name: 'Customer Support Pipeline',
  description: 'Automated customer support workflow with triage and escalation',
  trigger: {
    type: 'webhook',
    config: {
      webhookUrl: '/webhook/support',
    },
  },
  nodes: [
    {
      id: 'webhook-trigger',
      type: 'trigger',
    },
    {
      id: 'triage-agent',
      type: 'agent',
      agent: {
        id: 'triage',
        name: 'Triage Agent',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        systemPrompt: 'Categorize the customer inquiry by urgency: low, medium, or high',
        parameters: {
          temperature: 0.3,
          maxTokens: 500,
        },
      },
    },
    {
      id: 'priority-check',
      type: 'condition',
    },
    {
      id: 'high-priority-agent',
      type: 'agent',
      agent: {
        id: 'high-priority',
        name: 'Senior Support Agent',
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'Handle high-priority customer issues with care and urgency',
        parameters: {
          temperature: 0.7,
        },
      },
    },
    {
      id: 'standard-agent',
      type: 'agent',
      agent: supportAgent,
    },
    {
      id: 'response-formatter',
      type: 'end',
    },
  ],
  connections: [
    { id: 'c1', sourceId: 'webhook-trigger', targetId: 'triage-agent' },
    { id: 'c2', sourceId: 'triage-agent', targetId: 'priority-check' },
    { id: 'c3', sourceId: 'priority-check', targetId: 'high-priority-agent', condition: 'high' },
    { id: 'c4', sourceId: 'priority-check', targetId: 'standard-agent', condition: 'low,medium' },
    { id: 'c5', sourceId: 'high-priority-agent', targetId: 'response-formatter' },
    { id: 'c6', sourceId: 'standard-agent', targetId: 'response-formatter' },
  ],
  variables: [
    {
      name: 'customer_id',
      type: 'string',
      description: 'Customer identifier',
      required: true,
    },
    {
      name: 'inquiry_text',
      type: 'string',
      description: 'Customer inquiry message',
      required: true,
    },
  ],
  tags: ['support', 'customer-service', 'automation'],
};

// Convert workflow to n8n format
console.log('🔧 Converting workflow to n8n format...\n');
const n8nWorkflow = mapWorkflowToN8n(supportWorkflow, {
  startPosition: [250, 300],
  nodeSpacing: 220,
  workflowSettings: {
    executionOrder: 'v1',
    saveExecutionProgress: true,
    saveManualExecutions: true,
  },
});

console.log('n8n Workflow:');
console.log(JSON.stringify(n8nWorkflow, null, 2));
console.log('\n---\n');

console.log('✅ Conversion complete!');
console.log(`   - ${n8nWorkflow.nodes.length} nodes created`);
console.log(`   - ${Object.keys(n8nWorkflow.connections).length} connection groups defined`);
console.log('\n💡 You can now import this JSON into n8n for execution.');
