/**
 * n8n Framework Adapter
 * Converts AI Agent Schema to n8n workflow format
 */

import type { AgentConfig } from '../types/agent.js';
import type { WorkflowConfig } from '../types/workflow.js';
import type {
  N8nNode,
  N8nWorkflow,
  N8nConnection,
  N8nAdapterOptions,
} from '../types/adapters.js';

/**
 * Maps an AI agent configuration to an n8n node
 *
 * @param agent - Agent configuration to convert
 * @param options - Adapter options
 * @returns n8n node definition
 *
 * @example
 * ```typescript
 * const agent = {
 *   id: 'agent1',
 *   name: 'Customer Support Agent',
 *   role: 'customer-support',
 *   provider: 'openai',
 *   model: 'gpt-4',
 * };
 *
 * const n8nNode = mapAgentToN8nNode(agent);
 * ```
 */
export function mapAgentToN8nNode(
  agent: AgentConfig,
  options: N8nAdapterOptions = {}
): N8nNode {
  const { startPosition = [250, 300], includeCredentials = true } = options;

  // Map provider to n8n credential type
  const credentialMap: Record<string, string> = {
    openai: 'openAiApi',
    anthropic: 'anthropicApi',
    google: 'googlePalmApi',
    mistral: 'mistralApi',
    cohere: 'cohereApi',
    'azure-openai': 'azureOpenAiApi',
    bedrock: 'awsApi',
  };

  // Build node parameters
  const parameters: Record<string, unknown> = {
    // Agent identification
    agentId: agent.id,
    agentName: agent.name,
    description: agent.description || '',

    // Model configuration
    model: agent.model,
    provider: agent.provider,

    // System prompt
    systemPrompt: agent.systemPrompt || '',

    // Model parameters
    ...(agent.parameters && {
      temperature: agent.parameters.temperature ?? 0.7,
      maxTokens: agent.parameters.maxTokens ?? 1000,
      topP: agent.parameters.topP ?? 1.0,
      frequencyPenalty: agent.parameters.frequencyPenalty,
      presencePenalty: agent.parameters.presencePenalty,
    }),

    // Tools
    ...(agent.tools &&
      agent.tools.length > 0 && {
        tools: agent.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        })),
      }),

    // Memory configuration
    ...(agent.memory && {
      memory: {
        type: agent.memory.type,
        maxMessages: agent.memory.maxMessages,
        persistent: agent.memory.persistent,
      },
    }),

    // Metadata
    ...(agent.metadata && {
      metadata: agent.metadata,
    }),
  };

  // Build credentials
  const credentials: N8nNode['credentials'] =
    includeCredentials && credentialMap[agent.provider]
      ? {
          [credentialMap[agent.provider]]: {
            id: '1', // Placeholder - n8n will assign actual ID
            name: `${agent.provider} Account`,
          },
        }
      : undefined;

  return {
    name: agent.name || agent.id,
    type: 'n8n-nodes-langchain.agent',
    typeVersion: 1,
    position: startPosition,
    parameters,
    credentials,
  };
}

/**
 * Maps a workflow configuration to n8n workflow format
 *
 * @param workflow - Workflow configuration to convert
 * @param options - Adapter options
 * @returns n8n workflow definition
 *
 * @example
 * ```typescript
 * const workflow = {
 *   id: 'workflow1',
 *   name: 'Customer Support Workflow',
 *   nodes: [
 *     { id: 'start', type: 'trigger', config: { triggerType: 'webhook' } },
 *     { id: 'agent1', type: 'agent', config: { agentId: 'support-agent' } },
 *   ],
 *   connections: [
 *     { from: 'start', to: 'agent1' },
 *   ],
 * };
 *
 * const n8nWorkflow = mapWorkflowToN8n(workflow);
 * ```
 */
export function mapWorkflowToN8n(
  workflow: WorkflowConfig,
  options: N8nAdapterOptions = {}
): N8nWorkflow {
  const {
    startPosition = [250, 300],
    nodeSpacing = 220,
    workflowSettings,
  } = options;

  const nodes: N8nNode[] = [];
  const connections: Record<string, { main: N8nConnection[][] }> = {};

  // Calculate node positions in a left-to-right layout
  const nodePositions = calculateNodePositions(
    workflow.nodes.map((n) => n.id),
    workflow.connections.map((c) => ({ from: c.sourceId, to: c.targetId })),
    startPosition,
    nodeSpacing
  );

  // Convert workflow nodes to n8n nodes
  workflow.nodes.forEach((node, index) => {
    const position = nodePositions[node.id] || [
      startPosition[0] + index * nodeSpacing,
      startPosition[1],
    ];

    let n8nNode: N8nNode;

    switch (node.type) {
      case 'trigger':
        n8nNode = {
          name: `Trigger ${node.id}`,
          type: workflow.trigger
            ? mapTriggerToN8nType(workflow.trigger.type)
            : 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: position as [number, number],
          parameters: {
            ...(workflow.trigger?.config?.webhookUrl && {
              path: workflow.trigger.config.webhookUrl,
            }),
            ...(workflow.trigger?.config?.schedule && {
              rule: workflow.trigger.config.schedule,
            }),
            ...(workflow.trigger?.config?.eventName && {
              events: [workflow.trigger.config.eventName],
            }),
          },
        };
        break;

      case 'agent': {
        // If agent config is inline, use it; otherwise reference by ID
        const agentConfig = node.agent;
        if (agentConfig) {
          n8nNode = mapAgentToN8nNode(agentConfig, {
            startPosition: position as [number, number],
          });
        } else {
          n8nNode = {
            name: `Agent ${node.id}`,
            type: 'n8n-nodes-langchain.agent',
            typeVersion: 1,
            position: position as [number, number],
            parameters: {
              agentId: node.agentId || node.id,
            },
          };
        }
        break;
      }

      case 'condition':
        n8nNode = {
          name: `Condition ${node.id}`,
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: position as [number, number],
          parameters: {
            conditions: {
              string: [
                {
                  value1: '={{$json.condition}}',
                  operation: 'equals',
                  value2: 'true',
                },
              ],
            },
          },
        };
        break;

      case 'loop':
        n8nNode = {
          name: `Loop ${node.id}`,
          type: 'n8n-nodes-base.splitInBatches',
          typeVersion: 1,
          position: position as [number, number],
          parameters: {
            batchSize: 1,
            options: {},
          },
        };
        break;

      case 'end':
        n8nNode = {
          name: `End ${node.id}`,
          type: 'n8n-nodes-base.noOp',
          typeVersion: 1,
          position: position as [number, number],
          parameters: {},
        };
        break;

      default:
        // Default to NoOp node
        n8nNode = {
          name: node.id,
          type: 'n8n-nodes-base.noOp',
          typeVersion: 1,
          position: position as [number, number],
          parameters: {},
        };
    }

    nodes.push(n8nNode);
  });

  // Build connections
  workflow.connections.forEach((conn) => {
    const fromNode = nodes.find(
      (n) =>
        n.name.includes(conn.sourceId) || n.parameters.agentId === conn.sourceId
    );
    const toNode = nodes.find(
      (n) =>
        n.name.includes(conn.targetId) || n.parameters.agentId === conn.targetId
    );

    if (!fromNode || !toNode) {
      return; // Skip invalid connections
    }

    const fromName = fromNode.name;
    const outputIndex = conn.condition ? 0 : 0; // Conditional connections use output 0

    if (!connections[fromName]) {
      connections[fromName] = { main: [[]] };
    }

    // Ensure the output array exists
    while (connections[fromName].main.length <= outputIndex) {
      connections[fromName].main.push([]);
    }

    connections[fromName].main[outputIndex].push({
      node: toNode.name,
      type: 'main',
      index: 0,
    });
  });

  return {
    name: workflow.name || workflow.id,
    nodes,
    connections,
    settings: workflowSettings || {
      executionOrder: 'v1',
      saveExecutionProgress: true,
      saveManualExecutions: true,
    },
    active: false,
    tags: workflow.metadata?.tags as string[] | undefined,
  };
}

/**
 * Helper: Map workflow trigger type to n8n node type
 */
function mapTriggerToN8nType(triggerType: string): string {
  const triggerMap: Record<string, string> = {
    webhook: 'n8n-nodes-base.webhook',
    schedule: 'n8n-nodes-base.scheduleTrigger',
    scheduled: 'n8n-nodes-base.scheduleTrigger',
    event: 'n8n-nodes-base.eventTrigger',
    manual: 'n8n-nodes-base.manualTrigger',
  };

  return triggerMap[triggerType] || 'n8n-nodes-base.manualTrigger';
}

/**
 * Helper: Calculate node positions for optimal layout
 * Uses a simple left-to-right topological ordering
 */
function calculateNodePositions(
  nodeIds: string[],
  connections: Array<{ from: string; to: string }>,
  startPosition: [number, number],
  spacing: number
): Record<string, [number, number]> {
  const positions: Record<string, [number, number]> = {};

  // Build adjacency list
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodeIds.forEach((id) => {
    graph.set(id, []);
    inDegree.set(id, 0);
  });

  connections.forEach(({ from, to }) => {
    graph.get(from)?.push(to);
    inDegree.set(to, (inDegree.get(to) || 0) + 1);
  });

  // Find starting nodes (no incoming edges)
  const queue: Array<{ id: string; level: number }> = [];
  nodeIds.forEach((id) => {
    if (inDegree.get(id) === 0) {
      queue.push({ id, level: 0 });
    }
  });

  // BFS to assign levels
  const levels = new Map<number, string[]>();
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);

    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level)!.push(id);

    const neighbors = graph.get(id) || [];
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        queue.push({ id: neighbor, level: level + 1 });
      }
    });
  }

  // Assign positions based on levels
  let currentLevel = 0;
  while (levels.has(currentLevel)) {
    const nodesInLevel = levels.get(currentLevel)!;
    nodesInLevel.forEach((nodeId, index) => {
      positions[nodeId] = [
        startPosition[0] + currentLevel * spacing,
        startPosition[1] + index * 100,
      ];
    });
    currentLevel++;
  }

  return positions;
}
