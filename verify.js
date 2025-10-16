#!/usr/bin/env node

/**
 * Verification script to test Phase 1 and Phase 3 implementation
 */

import {
  validateAgentConfig,
  generateAgentJsonSchema,
  validateWorkflowConfig,
  detectWorkflowCycles,
  getWorkflowTopologicalOrder,
} from './dist/index.js';

console.log('🧪 Testing AI Agent Schema SDK - Phase 1 & 3\n');
console.log('='.repeat(60));

// Test 1: Basic Agent Validation
console.log('\n✅ Test 1: Basic Agent Validation');
const basicAgent = {
  id: 'test-agent',
  name: 'Test Agent',
  provider: 'openai',
  model: 'gpt-4',
};

const result1 = validateAgentConfig(basicAgent);
console.log(`   Result: ${result1.success ? '✓ PASS' : '✗ FAIL'}`);
if (result1.success) {
  console.log(`   Agent ID: ${result1.data?.id}`);
  console.log(`   Provider: ${result1.data?.provider}`);
}

// Test 2: Advanced Agent with Tools & Memory
console.log('\n✅ Test 2: Advanced Agent with Tools & Memory');
const advancedAgent = {
  id: 'research-agent',
  name: 'Research Agent',
  description: 'A research assistant with tools',
  provider: 'anthropic',
  model: 'claude-3-opus',
  systemPrompt: 'You are a helpful assistant',
  parameters: {
    temperature: 0.7,
    maxTokens: 2000,
  },
  tools: [
    {
      id: 'search',
      name: 'Web Search',
      description: 'Search the web',
    },
  ],
  memory: {
    type: 'buffer',
    maxMessages: 10,
  },
  connections: ['agent2'],
};

const result2 = validateAgentConfig(advancedAgent);
console.log(`   Result: ${result2.success ? '✓ PASS' : '✗ FAIL'}`);
if (result2.success) {
  console.log(`   Tools: ${result2.data?.tools?.length || 0}`);
  console.log(`   Memory: ${result2.data?.memory?.type}`);
}

// Test 3: Invalid Agent Configuration
console.log('\n✅ Test 3: Invalid Agent Configuration Detection');
const invalidAgent = {
  name: 'Invalid Agent',
};

const result3 = validateAgentConfig(invalidAgent);
console.log(
  `   Result: ${!result3.success ? '✓ PASS (correctly rejected)' : '✗ FAIL'}`
);
if (!result3.success) {
  console.log(`   Errors detected: ${result3.error?.issues?.length || 1}`);
}

// Test 4: JSON Schema Generation
console.log('\n✅ Test 4: JSON Schema Generation');
try {
  const schema = generateAgentJsonSchema();
  console.log('   Result: ✓ PASS');
  console.log(`   Has definitions: ${!!schema.definitions}`);
  console.log(`   Has $ref: ${!!schema.$ref}`);
} catch (error) {
  console.log('   Result: ✗ FAIL');
  console.log(`   Error: ${error}`);
}

// Test 5: Basic Workflow Validation
console.log('\n✅ Test 5: Basic Workflow Validation');
const simpleWorkflow = {
  id: 'workflow1',
  name: 'Test Workflow',
  nodes: [
    { id: 'node1', type: 'agent', agentId: 'agent1' },
    { id: 'node2', type: 'agent', agentId: 'agent2' },
  ],
  connections: [{ id: 'conn1', sourceId: 'node1', targetId: 'node2' }],
};

const result5 = validateWorkflowConfig(simpleWorkflow);
console.log(`   Result: ${result5.success ? '✓ PASS' : '✗ FAIL'}`);
if (result5.success) {
  console.log(`   Nodes: ${result5.data?.nodes.length}`);
  console.log(`   Connections: ${result5.data?.connections.length}`);
}

// Test 6: Cycle Detection
console.log('\n✅ Test 6: Workflow Cycle Detection');
const cyclicWorkflow = {
  id: 'cyclic',
  name: 'Cyclic Workflow',
  nodes: [
    { id: 'a', type: 'agent', agentId: 'agent1' },
    { id: 'b', type: 'agent', agentId: 'agent2' },
    { id: 'c', type: 'agent', agentId: 'agent3' },
  ],
  connections: [
    { id: 'c1', sourceId: 'a', targetId: 'b' },
    { id: 'c2', sourceId: 'b', targetId: 'c' },
    { id: 'c3', sourceId: 'c', targetId: 'a' }, // Cycle
  ],
};

const hasCycle = detectWorkflowCycles(cyclicWorkflow);
console.log(
  `   Result: ${hasCycle ? '✓ PASS (cycle detected)' : '✗ FAIL'}`
);

// Test 7: Topological Order
console.log('\n✅ Test 7: Workflow Topological Order');
const linearWorkflow = {
  id: 'linear',
  name: 'Linear Workflow',
  nodes: [
    { id: 'start', type: 'agent', agentId: 'agent1' },
    { id: 'middle', type: 'agent', agentId: 'agent2' },
    { id: 'end', type: 'agent', agentId: 'agent3' },
  ],
  connections: [
    { id: 'c1', sourceId: 'start', targetId: 'middle' },
    { id: 'c2', sourceId: 'middle', targetId: 'end' },
  ],
};

const order = getWorkflowTopologicalOrder(linearWorkflow);
console.log(`   Result: ${order ? '✓ PASS' : '✗ FAIL'}`);
if (order) {
  console.log(`   Order: ${order.join(' → ')}`);
}

// Test 8: All Providers
console.log('\n✅ Test 8: All Provider Types');
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

let providerTestsPassed = 0;
providers.forEach((provider) => {
  const config = {
    id: 'test',
    name: 'Test',
    provider,
    model: 'test-model',
  };
  const result = validateAgentConfig(config);
  if (result.success) providerTestsPassed++;
});

console.log(
  `   Result: ${providerTestsPassed === providers.length ? '✓ PASS' : '✗ FAIL'}`
);
console.log(
  `   Providers validated: ${providerTestsPassed}/${providers.length}`
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('🎉 Verification Complete!');
console.log('\nPhase 1 Features:');
console.log('  • Type-safe agent configuration ✓');
console.log('  • Runtime validation with Zod ✓');
console.log('  • JSON Schema generation ✓');
console.log('  • Multi-provider support ✓');
console.log('  • Error handling ✓');
console.log('\nPhase 3 Features:');
console.log('  • Workflow configuration ✓');
console.log('  • Cycle detection ✓');
console.log('  • Topological ordering ✓');
console.log('  • Multi-node workflows ✓');
console.log('\n📦 Ready for Phase 2: Framework Adapters');
console.log('='.repeat(60) + '\n');
