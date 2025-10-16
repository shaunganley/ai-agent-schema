/**
 * Example: Simple Linear Workflow
 *
 * This example demonstrates a basic workflow with agents connected in sequence.
 */

import {
  validateWorkflowConfig,
  type WorkflowConfig,
} from '../src/index.js';

// Define a simple research workflow
const researchWorkflow: WorkflowConfig = {
  id: 'research-workflow-1',
  name: 'Research and Summarize Workflow',
  description:
    'A workflow that researches a topic and then summarizes the findings',
  version: '1.0.0',
  nodes: [
    {
      id: 'start',
      type: 'trigger',
      position: { x: 100, y: 100 },
    },
    {
      id: 'research',
      type: 'agent',
      agentId: 'research-agent',
      position: { x: 300, y: 100 },
      metadata: {
        description: 'Research the given topic',
      },
    },
    {
      id: 'summarize',
      type: 'agent',
      agentId: 'summary-agent',
      position: { x: 500, y: 100 },
      metadata: {
        description: 'Summarize the research findings',
      },
    },
    {
      id: 'end',
      type: 'end',
      position: { x: 700, y: 100 },
    },
  ],
  connections: [
    {
      id: 'conn-1',
      sourceId: 'start',
      targetId: 'research',
      label: 'Start Research',
    },
    {
      id: 'conn-2',
      sourceId: 'research',
      targetId: 'summarize',
      label: 'Research Complete',
    },
    {
      id: 'conn-3',
      sourceId: 'summarize',
      targetId: 'end',
      label: 'Summary Complete',
    },
  ],
  trigger: {
    type: 'manual',
  },
  variables: [
    {
      name: 'topic',
      type: 'string',
      required: true,
      description: 'The topic to research',
    },
    {
      name: 'maxResults',
      type: 'number',
      defaultValue: 10,
      description: 'Maximum number of research results',
    },
  ],
  tags: ['research', 'summary', 'ai'],
};

// Validate the workflow
const result = validateWorkflowConfig(researchWorkflow);

if (result.success) {
  console.log('✅ Workflow is valid!');
  console.log('\nWorkflow Details:');
  console.log(`  ID: ${result.data?.id}`);
  console.log(`  Name: ${result.data?.name}`);
  console.log(`  Nodes: ${result.data?.nodes.length}`);
  console.log(`  Connections: ${result.data?.connections.length}`);
  console.log(`  Variables: ${result.data?.variables?.length || 0}`);
  console.log('\nNode Flow:');
  result.data?.nodes.forEach((node, index) => {
    console.log(`  ${index + 1}. ${node.id} (${node.type})`);
  });
} else {
  console.error('❌ Workflow validation failed:');
  console.error(result.error);
}

export { researchWorkflow };
