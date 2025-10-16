/**
 * Example: Scheduled Workflow with Loop
 *
 * This example demonstrates a workflow with scheduled execution and loop nodes
 * for iterative processing.
 */

import {
  validateWorkflowConfig,
  findDisconnectedNodes,
  type WorkflowConfig,
} from '../src/index.js';

// Define a data processing workflow with scheduled execution
const dataProcessingWorkflow: WorkflowConfig = {
  id: 'data-processing-workflow',
  name: 'Daily Data Processing Pipeline',
  description: 'Processes and analyzes data on a daily schedule',
  version: '1.2.0',
  nodes: [
    {
      id: 'scheduler',
      type: 'trigger',
      position: { x: 100, y: 200 },
    },
    {
      id: 'data-fetcher',
      type: 'agent',
      agentId: 'data-fetch-agent',
      position: { x: 300, y: 200 },
      metadata: {
        description: 'Fetches data from various sources',
      },
    },
    {
      id: 'loop-processor',
      type: 'loop',
      position: { x: 500, y: 200 },
      metadata: {
        iterateOver: 'data_items',
        maxIterations: 100,
      },
    },
    {
      id: 'analyzer-agent',
      type: 'agent',
      agentId: 'analysis-agent',
      position: { x: 700, y: 200 },
      metadata: {
        description: 'Analyzes each data item',
      },
    },
    {
      id: 'aggregator-agent',
      type: 'agent',
      agentId: 'aggregation-agent',
      position: { x: 700, y: 350 },
      metadata: {
        description: 'Aggregates analysis results',
      },
    },
    {
      id: 'report-generator',
      type: 'agent',
      agentId: 'report-agent',
      position: { x: 900, y: 275 },
      metadata: {
        description: 'Generates final report',
      },
    },
    {
      id: 'complete',
      type: 'end',
      position: { x: 1100, y: 275 },
    },
  ],
  connections: [
    {
      id: 'conn-1',
      sourceId: 'scheduler',
      targetId: 'data-fetcher',
      label: 'Trigger Daily',
    },
    {
      id: 'conn-2',
      sourceId: 'data-fetcher',
      targetId: 'loop-processor',
      label: 'Data Fetched',
    },
    {
      id: 'conn-3',
      sourceId: 'loop-processor',
      targetId: 'analyzer-agent',
      label: 'Each Item',
    },
    {
      id: 'conn-4',
      sourceId: 'analyzer-agent',
      targetId: 'loop-processor',
      label: 'Next Item',
    },
    {
      id: 'conn-5',
      sourceId: 'loop-processor',
      targetId: 'aggregator-agent',
      label: 'Loop Complete',
    },
    {
      id: 'conn-6',
      sourceId: 'aggregator-agent',
      targetId: 'report-generator',
      label: 'Aggregated Data',
    },
    {
      id: 'conn-7',
      sourceId: 'report-generator',
      targetId: 'complete',
      label: 'Report Ready',
    },
  ],
  trigger: {
    type: 'schedule',
    config: {
      schedule: '0 0 * * *', // Daily at midnight
    },
  },
  variables: [
    {
      name: 'data_source',
      type: 'string',
      required: true,
      description: 'Source of data to process',
    },
    {
      name: 'date_range',
      type: 'object',
      defaultValue: {
        start: '{{today - 1 day}}',
        end: '{{today}}',
      },
      description: 'Date range for data processing',
    },
    {
      name: 'notification_email',
      type: 'string',
      required: false,
      description: 'Email for completion notification',
    },
  ],
  tags: ['data-processing', 'scheduled', 'automation', 'analytics'],
  metadata: {
    owner: 'Data Team',
    slaMinutes: 60,
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
    },
  },
};

// Validate the workflow
const result = validateWorkflowConfig(dataProcessingWorkflow);

if (result.success) {
  console.log('✅ Scheduled workflow is valid!');
  console.log('\nWorkflow Details:');
  console.log(`  ID: ${result.data?.id}`);
  console.log(`  Name: ${result.data?.name}`);
  console.log(`  Trigger: ${result.data?.trigger?.type}`);
  console.log(
    `  Schedule: ${result.data?.trigger?.config?.schedule || 'N/A'}`
  );

  // Check for disconnected nodes
  const disconnected = findDisconnectedNodes(result.data!);
  if (disconnected.length > 0) {
    console.log(`\n  ⚠️  Disconnected Nodes: ${disconnected.join(', ')}`);
  } else {
    console.log('\n  ✅ All nodes are connected');
  }

  console.log('\n  Loop Configuration:');
  const loopNode = result.data?.nodes.find((n) => n.type === 'loop');
  if (loopNode) {
    console.log(`    Node: ${loopNode.id}`);
    console.log(
      `    Iterate Over: ${loopNode.metadata?.iterateOver || 'N/A'}`
    );
    console.log(
      `    Max Iterations: ${loopNode.metadata?.maxIterations || 'unlimited'}`
    );
  }

  console.log('\n  Variables:');
  result.data?.variables?.forEach((variable) => {
    console.log(`    - ${variable.name} (${variable.type})`);
    console.log(`      Required: ${variable.required ? 'Yes' : 'No'}`);
    if (variable.defaultValue !== undefined) {
      console.log(
        `      Default: ${JSON.stringify(variable.defaultValue)}`
      );
    }
  });
} else {
  console.error('❌ Workflow validation failed:');
  console.error(result.error);
}

export { dataProcessingWorkflow };
