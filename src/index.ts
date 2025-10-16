/**
 * AI Agent Schema SDK
 *
 * A standardized JSON schema and TypeScript SDK for defining AI agents
 * and their configurations, enabling interoperability between AI frameworks.
 *
 * @packageDocumentation
 */

// ============================================================================
// Agent Types & Schemas
// ============================================================================

// Export types
export type {
  AgentConfig,
  AIProvider,
  MemoryConfig,
  Tool,
  ModelParameters,
  ValidationResult,
} from './types/agent.js';

// Export schemas
export {
  AgentConfigSchema,
  AIProviderSchema,
  MemoryConfigSchema,
  ToolSchema,
  ModelParametersSchema,
} from './schemas/agent.schema.js';

// Export validators
export {
  validateAgentConfig,
  validateAgentConfigStrict,
  validatePartialAgentConfig,
} from './utils/validator.js';

// Export schema generators
export {
  generateAgentJsonSchema,
  generateAgentJsonSchemaString,
} from './utils/schema-generator.js';

// ============================================================================
// Workflow Types & Schemas
// ============================================================================

// Export workflow types
export type {
  WorkflowConfig,
  WorkflowNode,
  WorkflowConnection,
  WorkflowTrigger,
  WorkflowVariable,
  NodePosition,
  WorkflowValidationResult,
  WorkflowExecutionContext,
} from './types/workflow.js';

// Export workflow schemas
export {
  WorkflowConfigSchema,
  WorkflowNodeSchema,
  WorkflowConnectionSchema,
  WorkflowTriggerSchema,
  WorkflowVariableSchema,
  NodePositionSchema,
} from './schemas/workflow.schema.js';

// Export workflow validators
export {
  validateWorkflowConfig,
  validateWorkflowConfigStrict,
  detectWorkflowCycles,
  getWorkflowTopologicalOrder,
  findDisconnectedNodes,
} from './utils/workflow-validator.js';

// Export workflow schema generators
export {
  generateWorkflowJsonSchema,
  generateWorkflowJsonSchemaString,
} from './utils/workflow-schema-generator.js';

// ============================================================================
// Framework Adapters
// ============================================================================

// Export adapter types
export type {
  // n8n types
  N8nNode,
  N8nWorkflow,
  N8nConnection,
  N8nParameter,
  N8nParameterType,
  N8nAdapterOptions,
  // LangChain types
  LangChainAgent,
  LangChainTool,
  LangChainMemory,
  LangChainAgentType,
  LangGraphWorkflow,
  LangGraphNode,
  LangChainAdapterOptions,
  // CrewAI types
  CrewAIAgent,
  CrewAITask,
  CrewAICrew,
  CrewAIRole,
  CrewAIProcess,
  CrewAIAdapterOptions,
} from './types/adapters.js';

// Export n8n adapter
export { mapAgentToN8nNode, mapWorkflowToN8n } from './adapters/n8n.adapter.js';

// Export LangChain adapter
export {
  mapAgentToLangChain,
  mapWorkflowToLangGraph,
} from './adapters/langchain.adapter.js';

// Export CrewAI adapter
export {
  mapAgentToCrewAgent,
  mapWorkflowToCrew,
} from './adapters/crewai.adapter.js';
