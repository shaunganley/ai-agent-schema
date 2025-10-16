# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-10-16

### Added

#### Phase 2: Framework Adapters ✅

- **n8n Adapter**
  - `mapAgentToN8nNode()` - Convert agents to n8n node format
  - `mapWorkflowToN8n()` - Convert workflows to n8n workflow format
  - Credential mapping for 8 AI providers (OpenAI, Anthropic, Google, Mistral, Cohere, Azure, Bedrock, Custom)
  - Automatic node positioning with topological layout algorithm
  - Support for webhook, scheduled, event, and manual triggers
  - Conditional and loop node handling
  - Tool and memory configuration mapping

- **LangChain Adapter**
  - `mapAgentToLangChain()` - Convert agents to LangChain agent format
  - `mapWorkflowToLangGraph()` - Convert workflows to LangGraph state graphs
  - Intelligent agent type selection (OpenAI functions, React, conversational)
  - Tool and memory configuration mapping
  - State graph generation with proper entry points
  - Conditional routing support (if/else branching)
  - Parallel execution support
  - Workflow variable mapping to state schema
  - Checkpointer configuration

- **CrewAI Adapter**
  - `mapAgentToCrewAgent()` - Convert agents to CrewAI agent format
  - `mapWorkflowToCrew()` - Convert workflows to CrewAI crew format
  - Role, goal, and backstory generation from agent config
  - Task creation with dependency mapping
  - Automatic process type selection (sequential vs hierarchical)
  - Tool configuration mapping
  - Memory and cache options
  - LLM configuration mapping

- **Type Definitions**
  - 23 new TypeScript interfaces for adapter types
  - Complete type coverage for n8n, LangChain, and CrewAI formats
  - Adapter options interfaces for customization

- **Testing**
  - 43 new adapter tests (total: 93 tests)
  - `tests/n8n.adapter.test.ts` - 14 tests
  - `tests/langchain.adapter.test.ts` - 14 tests
  - `tests/crewai.adapter.test.ts` - 15 tests
  - Coverage: agent mapping, workflow mapping, tools, memory, conditionals, loops

- **Examples**
  - `examples/n8n-adapter.ts` - Customer support workflow example
  - `examples/langchain-adapter.ts` - Research pipeline example
  - `examples/crewai-adapter.ts` - Content creation crew example
  - Real-world scenarios with execution pseudocode

- **Documentation**
  - Comprehensive adapter documentation in README
  - Phase 2 completion summary (PHASE_2_COMPLETE.md)
  - Usage examples for all three frameworks
  - API reference for adapter functions

### Changed

- Package version bumped to 0.4.0
- Bundle size: 25.86KB ESM (up from 9.47KB)
- Bundle size: 27.09KB CJS (up from 10.53KB)
- TypeScript definitions: 70.25KB (up from 59.7KB)
- Updated description: now mentions framework adapters
- Added keywords: n8n, langchain, crewai, adapter, framework
- README roadmap updated: Phase 2 marked complete

### Exports

All adapter functions and types now exported from main index:
- n8n: `mapAgentToN8nNode`, `mapWorkflowToN8n` + 6 types
- LangChain: `mapAgentToLangChain`, `mapWorkflowToLangGraph` + 7 types  
- CrewAI: `mapAgentToCrewAgent`, `mapWorkflowToCrew` + 6 types

## [0.3.0] - 2025-01-21

### Added

#### Phase 3: Workflow Orchestration ✅

- **Workflow Type System**
  - `WorkflowConfig` - Complete workflow configuration interface
  - `WorkflowNode` - 5 node types: agent, trigger, condition, transform, end
  - `WorkflowConnection` - Node connections with conditional routing
  - `WorkflowTrigger` - 4 trigger types: manual, scheduled, event, webhook
  - `WorkflowVariable` - Workflow-level variables with data passing
  - `WorkflowExecutionContext` - Runtime execution tracking

- **Graph Algorithms**
  - `detectWorkflowCycles()` - DFS-based cycle detection (O(V+E))
  - `getWorkflowTopologicalOrder()` - Kahn's algorithm for execution planning
  - `findDisconnectedNodes()` - Identify isolated nodes
  - `validateWorkflow()` - Comprehensive graph validation
  - Ensures DAG structure for parallel execution

- **Workflow Validation**
  - Connection reference validation (all connections point to valid nodes)
  - Agent node configuration validation (inline agent configs)
  - Cycle detection in workflow graphs
  - Disconnected node detection
  - Comprehensive error reporting with node paths

- **Workflow Schema Generation**
  - `generateWorkflowJsonSchema()` - Generate workflow JSON Schema
  - `generateWorkflowJsonSchemaString()` - Pretty-printed workflow schema
  - Support for workflow builder UIs

- **Testing & Examples**
  - 32 new workflow tests (21 validation + 11 schema generation)
  - 3 working examples:
    - `simple-workflow.ts` - Basic linear workflow
    - `complex-workflow.ts` - Multi-path conditional workflow
    - `scheduled-workflow.ts` - Scheduled workflow with variables
  - Total test suite: 50 tests (all passing)

- **Documentation**
  - Updated README with workflow features
  - Phase 3 completion summary (PHASE_3_COMPLETE.md)
  - Workflow API reference
  - Graph algorithm documentation

### Changed

- Package version bumped to 0.3.0
- Bundle size updated: 9.5KB ESM, 10.5KB CJS, 59.7KB TypeScript definitions
- README updated with workflow orchestration section
- Verification script updated to test workflow features

## [0.1.0] - 2025-01-15

### Added

#### Phase 1: Core Schema + Validator ✅

- **Core Type System**
  - `AgentConfig` interface for agent configuration
  - `AIProvider` type supporting 8 major providers (OpenAI, Anthropic, Google, Mistral, Cohere, Azure OpenAI, Bedrock, Custom)
  - `ModelParameters` for controlling AI behavior (temperature, max tokens, etc.)
  - `Tool` interface for defining agent capabilities
  - `MemoryConfig` for agent memory configuration
  - `ValidationResult` for type-safe validation results

- **Validation System**
  - `validateAgentConfig()` - Safe validation with detailed error reporting
  - `validateAgentConfigStrict()` - Strict validation that throws on error
  - `validatePartialAgentConfig()` - Validate partial configurations
  - Runtime validation using Zod
  - Detailed error messages with field paths

- **Schema Generation**
  - `generateAgentJsonSchema()` - Generate JSON Schema for form builders
  - `generateAgentJsonSchemaString()` - Pretty-printed JSON Schema
  - Compatible with react-jsonschema-form and similar tools

- **Development Tools**
  - Full TypeScript support with strict typing
  - Comprehensive test suite (18 tests)
  - ESLint and Prettier configuration
  - Vitest for testing
  - tsup for building
  - Source maps for debugging
  - GitHub Actions CI/CD workflow

- **Documentation**
  - Comprehensive README with examples
  - API reference documentation
  - Contributing guidelines
  - Three working examples (basic agent, agent with tools, JSON schema generation)
  - Phase 1 completion summary

- **Build System**
  - ES Module and CommonJS support
  - TypeScript declaration files
  - Optimized bundle size (~3.5KB base, 9.5KB with workflow)
  - Tree-shakable exports

### Project Infrastructure

- MIT License
- npm package configuration
- Git repository structure
- Verification script for testing all features

## [Unreleased]

### Planned for Phase 4: UI Integration

- Example form generator using JSON Schema
- Visual agent builder
- Visual workflow designer with drag-and-drop
- Real-time workflow validation UI

### Planned for Phase 5: Plugin Ecosystem

- Dynamic adapter registration
- Provider plugins
- Custom tool definitions
- Custom workflow node types

[0.4.0]: https://github.com/shaunganley/ai-agent-schema/releases/tag/v0.4.0
[0.3.0]: https://github.com/shaunganley/ai-agent-schema/releases/tag/v0.3.0
[0.1.0]: https://github.com/shaunganley/ai-agent-schema/releases/tag/v0.1.0
