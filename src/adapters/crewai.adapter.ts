/**
 * CrewAI Framework Adapter
 * Converts AI Agent Schema to CrewAI format
 */

import type { AgentConfig } from '../types/agent.js';
import type { WorkflowConfig } from '../types/workflow.js';
import type {
  CrewAIAgent,
  CrewAITask,
  CrewAICrew,
  CrewAIProcess,
  CrewAIAdapterOptions,
} from '../types/adapters.js';

/**
 * Maps an AI agent configuration to CrewAI agent format
 *
 * @param agent - Agent configuration to convert
 * @param options - Adapter options
 * @returns CrewAI agent configuration
 *
 * @example
 * ```typescript
 * const agent = {
 *   id: 'agent1',
 *   name: 'Research Agent',
 *   description: 'Conducts research on various topics',
 *   provider: 'openai',
 *   model: 'gpt-4',
 *   systemPrompt: 'You are an expert researcher',
 * };
 *
 * const crewAgent = mapAgentToCrewAgent(agent);
 * ```
 */
export function mapAgentToCrewAgent(
  agent: AgentConfig,
  options: CrewAIAdapterOptions = {}
): CrewAIAgent {
  const { verbose = false, enableMemory = true, enableCache = true } = options;

  // Generate role from name/description
  const role = agent.name || agent.id;

  // Generate goal from system prompt or description
  const goal =
    agent.systemPrompt || agent.description || `Execute tasks as ${role}`;

  // Generate backstory to provide context
  const backstory = agent.description
    ? `${agent.description}. ${agent.systemPrompt || ''}`
    : agent.systemPrompt ||
      `An AI agent specialized in performing tasks related to ${role}.`;

  // Map tools
  const tools = agent.tools?.map((tool) => tool.name);

  // Map LLM configuration
  const llm = {
    model: mapCrewAIModel(agent.provider, agent.model),
    temperature: agent.parameters?.temperature ?? 0.7,
    maxTokens: agent.parameters?.maxTokens ?? 1000,
    topP: agent.parameters?.topP ?? 1.0,
  };

  return {
    role,
    goal,
    backstory,
    tools,
    llm,
    verbose,
    allowDelegation: true, // CrewAI default
    maxIter: 15,
    memory: enableMemory && agent.memory?.type !== 'none',
    cache: enableCache,
  };
}

/**
 * Maps a workflow configuration to CrewAI crew format
 *
 * @param workflow - Workflow configuration to convert
 * @param options - Adapter options
 * @returns CrewAI crew configuration
 *
 * @example
 * ```typescript
 * const workflow = {
 *   id: 'workflow1',
 *   name: 'Research and Write Crew',
 *   nodes: [
 *     { id: 'researcher', type: 'agent', agent: researcherConfig },
 *     { id: 'writer', type: 'agent', agent: writerConfig },
 *   ],
 *   connections: [
 *     { id: 'c1', sourceId: 'researcher', targetId: 'writer' },
 *   ],
 * };
 *
 * const crew = mapWorkflowToCrew(workflow);
 * ```
 */
export function mapWorkflowToCrew(
  workflow: WorkflowConfig,
  options: CrewAIAdapterOptions = {}
): CrewAICrew {
  const {
    process = determineProcessType(workflow),
    verbose = false,
    enableMemory = true,
    enableCache = true,
    maxRpm = 10,
  } = options;

  const agents: CrewAIAgent[] = [];
  const tasks: CrewAITask[] = [];

  // Build dependency map for task context
  const dependencyMap = new Map<string, string[]>();
  workflow.connections.forEach((conn) => {
    const deps = dependencyMap.get(conn.targetId) || [];
    deps.push(conn.sourceId);
    dependencyMap.set(conn.targetId, deps);
  });

  // Convert workflow nodes to agents and tasks
  workflow.nodes.forEach((node, index) => {
    if (node.type === 'agent') {
      const agentConfig = node.agent;

      if (agentConfig) {
        // Convert agent config to CrewAI agent
        const crewAgent = mapAgentToCrewAgent(agentConfig, options);
        agents.push(crewAgent);

        // Create a task for this agent
        const dependencies = dependencyMap.get(node.id) || [];
        const task: CrewAITask = {
          description:
            agentConfig.systemPrompt ||
            agentConfig.description ||
            `Execute task ${index + 1}`,
          expectedOutput: `Results from ${crewAgent.role}`,
          agent: crewAgent.role,
          tools: agentConfig.tools?.map((t) => t.name),
          context: dependencies
            .map((depId) => {
              const depNode = workflow.nodes.find((n) => n.id === depId);
              return depNode?.type === 'agent' ? depId : undefined;
            })
            .filter(Boolean) as string[],
          async: process === 'hierarchical',
        };

        tasks.push(task);
      }
    }
  });

  return {
    name: workflow.name || workflow.id,
    agents,
    tasks,
    process,
    verbose,
    memory: enableMemory,
    cache: enableCache,
    maxRpm,
    shareCrewAI: false,
  };
}

/**
 * Helper: Determine appropriate CrewAI process type based on workflow structure
 */
function determineProcessType(workflow: WorkflowConfig): CrewAIProcess {
  // Check if workflow has branching (multiple outputs from one node)
  const hasBranching = workflow.connections.some((conn) => {
    const otherConns = workflow.connections.filter(
      (c) => c.sourceId === conn.sourceId
    );
    return otherConns.length > 1;
  });

  // Check if workflow is linear (each node has at most one predecessor and successor)
  const isLinear = workflow.nodes.every((node) => {
    const incoming = workflow.connections.filter((c) => c.targetId === node.id);
    const outgoing = workflow.connections.filter((c) => c.sourceId === node.id);
    return incoming.length <= 1 && outgoing.length <= 1;
  });

  if (hasBranching || !isLinear) {
    return 'hierarchical'; // Complex workflows need hierarchical
  }

  return 'sequential'; // Simple linear workflows
}

/**
 * Helper: Map provider and model to CrewAI model identifier
 */
function mapCrewAIModel(provider: string, model: string): string {
  // CrewAI uses provider/model format similar to LiteLLM
  const providerMap: Record<string, string> = {
    openai: 'openai',
    anthropic: 'anthropic',
    google: 'google',
    mistral: 'mistral',
    cohere: 'cohere',
    'azure-openai': 'azure',
    bedrock: 'bedrock',
    custom: 'custom',
  };

  const mappedProvider = providerMap[provider] || provider;
  return `${mappedProvider}/${model}`;
}
