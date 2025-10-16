/**
 * LangChain Framework Adapter
 * Converts AI Agent Schema to LangChain format
 */

import type { AgentConfig } from '../types/agent.js';
import type { WorkflowConfig } from '../types/workflow.js';
import type {
  LangChainAgent,
  LangChainAgentType,
  LangChainTool,
  LangChainMemory,
  LangGraphWorkflow,
  LangGraphNode,
  LangChainAdapterOptions,
} from '../types/adapters.js';

/**
 * Maps an AI agent configuration to LangChain agent format
 *
 * @param agent - Agent configuration to convert
 * @param options - Adapter options
 * @returns LangChain agent configuration
 *
 * @example
 * ```typescript
 * const agent = {
 *   id: 'agent1',
 *   name: 'Research Agent',
 *   provider: 'openai',
 *   model: 'gpt-4',
 *   systemPrompt: 'You are a research assistant',
 * };
 *
 * const lcAgent = mapAgentToLangChain(agent);
 * ```
 */
export function mapAgentToLangChain(
  agent: AgentConfig,
  options: LangChainAdapterOptions = {}
): LangChainAgent {
  const {
    agentType = determineAgentType(agent),
    verbose = false,
    maxIterations = 15,
    returnIntermediateSteps = false,
  } = options;

  // Map tools
  const tools: LangChainTool[] = (agent.tools || []).map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
    returnDirect: false,
  }));

  // Map memory
  const memory: LangChainMemory | undefined = agent.memory
    ? {
        type: mapMemoryType(agent.memory.type),
        config: {
          k: agent.memory.maxMessages,
          memoryKey: 'chat_history',
          inputKey: 'input',
          outputKey: 'output',
          returnMessages: true,
        },
      }
    : undefined;

  // Map model parameters
  const llm = {
    modelName: mapModelName(agent.provider, agent.model),
    temperature: agent.parameters?.temperature ?? 0.7,
    maxTokens: agent.parameters?.maxTokens ?? 1000,
    topP: agent.parameters?.topP ?? 1.0,
    frequencyPenalty: agent.parameters?.frequencyPenalty ?? 0,
    presencePenalty: agent.parameters?.presencePenalty ?? 0,
    timeout: 60000,
    maxRetries: 2,
  };

  return {
    agentType,
    llm,
    tools,
    memory,
    systemMessage: agent.systemPrompt,
    verbose,
    maxIterations,
    returnIntermediateSteps,
  };
}

/**
 * Maps a workflow configuration to LangGraph workflow format
 *
 * @param workflow - Workflow configuration to convert
 * @param options - Adapter options
 * @returns LangGraph workflow definition
 *
 * @example
 * ```typescript
 * const workflow = {
 *   id: 'workflow1',
 *   name: 'Research Pipeline',
 *   nodes: [
 *     { id: 'start', type: 'trigger' },
 *     { id: 'research', type: 'agent', agentId: 'research-agent' },
 *     { id: 'end', type: 'end' },
 *   ],
 *   connections: [
 *     { id: 'c1', sourceId: 'start', targetId: 'research' },
 *     { id: 'c2', sourceId: 'research', targetId: 'end' },
 *   ],
 * };
 *
 * const lgWorkflow = mapWorkflowToLangGraph(workflow);
 * ```
 */
export function mapWorkflowToLangGraph(
  workflow: WorkflowConfig,
  options: LangChainAdapterOptions = {}
): LangGraphWorkflow {
  const nodes: Record<string, LangGraphNode> = {};

  // Find entry point (trigger or first node)
  const triggerNode = workflow.nodes.find((n) => n.type === 'trigger');
  const entryPoint = triggerNode?.id || workflow.nodes[0]?.id || 'start';

  // Convert workflow nodes to LangGraph nodes
  workflow.nodes.forEach((node) => {
    let lgNode: LangGraphNode;

    switch (node.type) {
      case 'trigger':
        lgNode = {
          id: node.id,
          type: 'prompt',
          config: {
            template: 'Start workflow with input: {input}',
          },
        };
        break;

      case 'agent': {
        // If agent config is inline, convert it
        const agentConfig = node.agent;
        if (agentConfig) {
          const lcAgent = mapAgentToLangChain(agentConfig, options);
          lgNode = {
            id: node.id,
            type: 'agent',
            config: {
              agentType: lcAgent.agentType,
              llm: lcAgent.llm,
              tools: lcAgent.tools,
              memory: lcAgent.memory,
              systemMessage: lcAgent.systemMessage,
            },
          };
        } else {
          // Reference by ID
          lgNode = {
            id: node.id,
            type: 'agent',
            config: {
              agentId: node.agentId || node.id,
            },
          };
        }
        break;
      }

      case 'condition':
        lgNode = {
          id: node.id,
          type: 'conditional',
          config: {
            condition: 'lambda x: x.get("condition", True)',
          },
        };
        break;

      case 'loop':
        lgNode = {
          id: node.id,
          type: 'tool',
          config: {
            name: 'loop',
            description: 'Iterate over items',
          },
        };
        break;

      case 'end':
        lgNode = {
          id: node.id,
          type: 'llm',
          config: {
            template: 'Workflow completed. Output: {output}',
          },
        };
        break;

      default:
        lgNode = {
          id: node.id,
          type: 'llm',
          config: {},
        };
    }

    // Determine next nodes based on connections
    const outgoingConnections = workflow.connections.filter(
      (c) => c.sourceId === node.id
    );

    if (outgoingConnections.length === 1) {
      // Simple connection
      lgNode.next = outgoingConnections[0].targetId;
    } else if (outgoingConnections.length > 1) {
      // Conditional or parallel
      const hasConditions = outgoingConnections.some((c) => c.condition);
      if (hasConditions) {
        // Conditional routing
        lgNode.next = Object.fromEntries(
          outgoingConnections.map((c) => [c.condition || 'default', c.targetId])
        );
      } else {
        // Parallel execution
        lgNode.next = outgoingConnections.map((c) => c.targetId);
      }
    }

    nodes[node.id] = lgNode;
  });

  // Build edges array
  const edges = workflow.connections.map((conn) => ({
    source: conn.sourceId,
    target: conn.targetId,
    condition: conn.condition,
  }));

  // Define state schema based on workflow variables
  const stateSchema: Record<string, unknown> = {};
  const stateDefault: Record<string, unknown> = {};

  (workflow.variables || []).forEach((variable) => {
    stateSchema[variable.name] = variable.type;
    if (variable.defaultValue !== undefined) {
      stateDefault[variable.name] = variable.defaultValue;
    }
  });

  // Add default state fields
  stateSchema['input'] = 'string';
  stateSchema['output'] = 'string';
  stateDefault['input'] = '';
  stateDefault['output'] = '';

  return {
    name: workflow.name || workflow.id,
    nodes,
    edges,
    entryPoint,
    state: {
      schema: stateSchema,
      default: stateDefault,
    },
    checkpointer: {
      type: 'memory',
      config: {},
    },
  };
}

/**
 * Helper: Determine appropriate LangChain agent type based on configuration
 */
function determineAgentType(agent: AgentConfig): LangChainAgentType {
  // If agent has tools, use appropriate tool-calling agent
  if (agent.tools && agent.tools.length > 0) {
    if (agent.provider === 'openai') {
      return 'openai-functions';
    }
    return 'zero-shot-react-description';
  }

  // If agent has memory, use conversational agent
  if (agent.memory && agent.memory.type !== 'none') {
    return 'conversational-react-description';
  }

  // Default to zero-shot react
  return 'zero-shot-react-description';
}

/**
 * Helper: Map memory type to LangChain memory type
 */
function mapMemoryType(memoryType: string): LangChainMemory['type'] {
  const memoryMap: Record<string, LangChainMemory['type']> = {
    buffer: 'buffer',
    summary: 'summary',
    vector: 'knowledge-graph',
    none: 'buffer',
  };

  return memoryMap[memoryType] || 'buffer';
}

/**
 * Helper: Map provider and model to LangChain model name
 */
function mapModelName(provider: string, model: string): string {
  const providerPrefixes: Record<string, string> = {
    openai: 'openai/',
    anthropic: 'anthropic/',
    google: 'google/',
    mistral: 'mistral/',
    cohere: 'cohere/',
    'azure-openai': 'azure/',
    bedrock: 'bedrock/',
    custom: '',
  };

  const prefix = providerPrefixes[provider] || '';
  return `${prefix}${model}`;
}
