/**
 * Type definitions for framework adapters
 * Supports n8n, LangChain, and CrewAI formats
 */

// ============================================================================
// n8n Types
// ============================================================================

/**
 * n8n node parameter type
 */
export type N8nParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'options'
  | 'multiOptions'
  | 'json'
  | 'collection';

/**
 * n8n node parameter definition
 */
export interface N8nParameter {
  displayName: string;
  name: string;
  type: N8nParameterType;
  default?: unknown;
  required?: boolean;
  description?: string;
  options?: Array<{ name: string; value: string }>;
  placeholder?: string;
  typeOptions?: {
    multipleValues?: boolean;
    minValue?: number;
    maxValue?: number;
  };
}

/**
 * n8n node definition
 */
export interface N8nNode {
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, { id: string; name: string }>;
}

/**
 * n8n workflow connection
 */
export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

/**
 * n8n workflow definition
 */
export interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, { main: N8nConnection[][] }>;
  settings?: {
    executionOrder?: 'v0' | 'v1';
    saveExecutionProgress?: boolean;
    saveManualExecutions?: boolean;
  };
  staticData?: Record<string, unknown>;
  tags?: string[];
  active?: boolean;
}

// ============================================================================
// LangChain Types
// ============================================================================

/**
 * LangChain agent type
 */
export type LangChainAgentType =
  | 'zero-shot-react-description'
  | 'react-docstore'
  | 'self-ask-with-search'
  | 'conversational-react-description'
  | 'chat-zero-shot-react-description'
  | 'chat-conversational-react-description'
  | 'structured-chat-zero-shot-react-description'
  | 'openai-functions'
  | 'openai-multi-functions';

/**
 * LangChain tool definition
 */
export interface LangChainTool {
  name: string;
  description: string;
  func?: (input: string) => Promise<string> | string;
  parameters?: Record<string, unknown>;
  returnDirect?: boolean;
}

/**
 * LangChain memory configuration
 */
export interface LangChainMemory {
  type: 'buffer' | 'buffer-window' | 'summary' | 'entity' | 'knowledge-graph';
  config?: {
    k?: number; // For window memory
    maxTokenLimit?: number; // For summary memory
    memoryKey?: string;
    inputKey?: string;
    outputKey?: string;
    returnMessages?: boolean;
  };
}

/**
 * LangChain agent configuration
 */
export interface LangChainAgent {
  agentType: LangChainAgentType;
  llm: {
    modelName: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    timeout?: number;
    maxRetries?: number;
  };
  tools: LangChainTool[];
  memory?: LangChainMemory;
  systemMessage?: string;
  humanMessage?: string;
  verbose?: boolean;
  maxIterations?: number;
  returnIntermediateSteps?: boolean;
  callbacks?: unknown[];
}

/**
 * LangGraph node definition
 */
export interface LangGraphNode {
  id: string;
  type: 'agent' | 'tool' | 'llm' | 'prompt' | 'conditional';
  config: Record<string, unknown>;
  next?: string | string[] | Record<string, string>; // Simple, parallel, or conditional
}

/**
 * LangGraph workflow (state graph)
 */
export interface LangGraphWorkflow {
  name: string;
  nodes: Record<string, LangGraphNode>;
  edges: Array<{
    source: string;
    target: string;
    condition?: string;
  }>;
  entryPoint: string;
  state: {
    schema: Record<string, unknown>;
    default: Record<string, unknown>;
  };
  checkpointer?: {
    type: 'memory' | 'sqlite' | 'postgres';
    config?: Record<string, unknown>;
  };
}

// ============================================================================
// CrewAI Types
// ============================================================================

/**
 * CrewAI agent role type
 */
export type CrewAIRole = string; // Flexible string for custom roles

/**
 * CrewAI agent configuration
 */
export interface CrewAIAgent {
  role: CrewAIRole;
  goal: string;
  backstory: string;
  tools?: string[]; // Tool names
  llm?: {
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
  verbose?: boolean;
  allowDelegation?: boolean;
  maxIter?: number;
  maxRpm?: number;
  memory?: boolean;
  cache?: boolean;
  systemTemplate?: string;
  promptTemplate?: string;
  responseTemplate?: string;
}

/**
 * CrewAI task definition
 */
export interface CrewAITask {
  description: string;
  expectedOutput: string;
  agent?: string; // Agent role reference
  tools?: string[];
  context?: string[]; // Task IDs that provide context
  async?: boolean;
  config?: Record<string, unknown>;
}

/**
 * CrewAI process type
 */
export type CrewAIProcess = 'sequential' | 'hierarchical' | 'consensual';

/**
 * CrewAI crew configuration
 */
export interface CrewAICrew {
  name: string;
  agents: CrewAIAgent[];
  tasks: CrewAITask[];
  process?: CrewAIProcess;
  verbose?: boolean;
  memory?: boolean;
  cache?: boolean;
  maxRpm?: number;
  shareCrewAI?: boolean;
  manager?: {
    llm?: CrewAIAgent['llm'];
    systemTemplate?: string;
    promptTemplate?: string;
  };
}

// ============================================================================
// Adapter Options
// ============================================================================

/**
 * Options for n8n adapter
 */
export interface N8nAdapterOptions {
  /** Starting position for nodes [x, y] */
  startPosition?: [number, number];
  /** Spacing between nodes */
  nodeSpacing?: number;
  /** Include credentials configuration */
  includeCredentials?: boolean;
  /** Workflow settings */
  workflowSettings?: N8nWorkflow['settings'];
}

/**
 * Options for LangChain adapter
 */
export interface LangChainAdapterOptions {
  /** Agent type to use */
  agentType?: LangChainAgentType;
  /** Include verbose logging */
  verbose?: boolean;
  /** Maximum iterations for agent */
  maxIterations?: number;
  /** Return intermediate steps */
  returnIntermediateSteps?: boolean;
}

/**
 * Options for CrewAI adapter
 */
export interface CrewAIAdapterOptions {
  /** Process type for crew */
  process?: CrewAIProcess;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Enable memory */
  enableMemory?: boolean;
  /** Enable caching */
  enableCache?: boolean;
  /** Maximum requests per minute */
  maxRpm?: number;
}
