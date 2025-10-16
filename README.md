# 🧠 AI Agent Schema

A standardized JSON schema and TypeScript SDK for defining AI agents and their configurations, enabling interoperability between AI frameworks.

[![npm version](https://badge.fury.io/js/@ai-agent%2Fschema.svg)](https://www.npmjs.com/package/@ai-agent/schema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

AI Agent Schema provides a **universal standard** for describing AI agents, their configuration, and how they connect in workflows. This enables seamless interoperability between different AI agent frameworks like n8n, LangChain, CrewAI, and Flowise.

## ✨ Features

- ✅ **Type-safe** TypeScript definitions
- ✅ **Runtime validation** using Zod
- ✅ **JSON Schema generation** for UI tools
- ✅ **Workflow orchestration** - Connect agents in DAG-based workflows
- ✅ **Lightweight** and tree-shakable
- ✅ **Provider-agnostic** (OpenAI, Anthropic, Google, and more)
- ✅ **Extensible** metadata and configuration
- ✅ **Cycle detection** and topological sorting for workflows

## 📦 Installation

```bash
npm install @ai-agent/schema
```

```bash
yarn add @ai-agent/schema
```

```bash
pnpm add @ai-agent/schema
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { validateAgentConfig, type AgentConfig } from '@ai-agent/schema';

// Define your agent configuration
const agentConfig = {
  id: 'agent1',
  name: 'Research Agent',
  provider: 'openai',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful research assistant',
  parameters: {
    temperature: 0.7,
    maxTokens: 2000,
  },
};

// Validate the configuration
const result = validateAgentConfig(agentConfig);

if (result.success) {
  console.log('Valid config:', result.data);
} else {
  console.error('Validation errors:', result.error);
}
```

### Advanced Configuration

```typescript
import { validateAgentConfig, type AgentConfig } from '@ai-agent/schema';

const advancedConfig: AgentConfig = {
  id: 'research-agent',
  name: 'Research Agent',
  description: 'An agent specialized in web research and analysis',
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',
  systemPrompt: 'You are a research assistant with access to web search.',
  parameters: {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
  },
  tools: [
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the web for current information',
      parameters: {
        query: { type: 'string' },
        maxResults: { type: 'number' },
      },
    },
  ],
  memory: {
    type: 'buffer',
    maxMessages: 10,
    persistent: false,
  },
  connections: ['summarizer-agent'],
  metadata: {
    version: '1.0.0',
    category: 'research',
  },
};

const result = validateAgentConfig(advancedConfig);
```

### Generate JSON Schema

```typescript
import { generateAgentJsonSchema } from '@ai-agent/schema';

// Generate JSON Schema for form builders
const jsonSchema = generateAgentJsonSchema();

// Use with react-jsonschema-form or other form generators
console.log(JSON.stringify(jsonSchema, null, 2));
```

## 📚 API Reference

### Types

#### `AgentConfig`

The main configuration interface for an AI agent.

```typescript
interface AgentConfig {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  description?: string;          // Optional description
  provider: AIProvider;          // AI model provider
  model: string;                 // Specific model identifier
  systemPrompt?: string;         // System instructions
  parameters?: ModelParameters;  // Model configuration
  tools?: Tool[];               // Available tools
  memory?: MemoryConfig;        // Memory settings
  connections?: string[];       // Connected agent IDs
  metadata?: Record<string, unknown>; // Custom metadata
}
```

#### `AIProvider`

Supported AI providers:

```typescript
type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'cohere'
  | 'azure-openai'
  | 'bedrock'
  | 'custom';
```

### Functions

#### `validateAgentConfig(config: unknown): ValidationResult`

Validates an agent configuration and returns a result object.

```typescript
const result = validateAgentConfig(config);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

#### `validateAgentConfigStrict(config: unknown): AgentConfig`

Validates and returns the config, or throws on error.

```typescript
try {
  const agent = validateAgentConfigStrict(config);
} catch (error) {
  console.error('Invalid config:', error);
}
```

#### `generateAgentJsonSchema(): object`

Generates a JSON Schema representation of the agent configuration.

```typescript
const schema = generateAgentJsonSchema();
```

### Workflow Functions

#### `validateWorkflowConfig(config: unknown): WorkflowValidationResult`

Validates a workflow configuration with multiple connected agents.

```

## 🔌 Framework Adapters

AI Agent Schema includes built-in adapters to convert your agent configurations to popular AI frameworks.

### n8n Adapter

Convert agents and workflows to [n8n](https://n8n.io/) format:

```typescript
import { mapAgentToN8nNode, mapWorkflowToN8n } from '@ai-agent/schema';

// Convert agent to n8n node
const n8nNode = mapAgentToN8nNode(agentConfig, {
  startPosition: [250, 300],
  includeCredentials: true,
});

// Convert workflow to n8n format
const n8nWorkflow = mapWorkflowToN8n(workflowConfig, {
  startPosition: [250, 300],
  nodeSpacing: 220,
  workflowSettings: {
    executionOrder: 'v1',
    saveExecutionProgress: true,
  },
});

// Import the JSON into n8n for execution
console.log(JSON.stringify(n8nWorkflow, null, 2));
```

### LangChain Adapter

Convert agents and workflows to [LangChain](https://www.langchain.com/) format:

```typescript
import { mapAgentToLangChain, mapWorkflowToLangGraph } from '@ai-agent/schema';

// Convert agent to LangChain format
const lcAgent = mapAgentToLangChain(agentConfig, {
  agentType: 'openai-functions',
  verbose: true,
  maxIterations: 15,
});

// Convert workflow to LangGraph format
const lgWorkflow = mapWorkflowToLangGraph(workflowConfig, {
  verbose: true,
});

// Use with LangChain
import { StateGraph } from '@langchain/langgraph';

const graph = new StateGraph({ channels: lgWorkflow.state.schema });
// Add nodes and edges from lgWorkflow
```

### CrewAI Adapter

Convert agents and workflows to [CrewAI](https://www.crewai.com/) format:

```typescript
import { mapAgentToCrewAgent, mapWorkflowToCrew } from '@ai-agent/schema';

// Convert agent to CrewAI format
const crewAgent = mapAgentToCrewAgent(agentConfig, {
  verbose: true,
  enableMemory: true,
  enableCache: true,
});

// Convert workflow to CrewAI crew
const crew = mapWorkflowToCrew(workflowConfig, {
  process: 'sequential',
  verbose: true,
});

// Use with CrewAI
from crewai import Agent, Task, Crew

agents = [Agent(**agent_config) for agent_config in crew['agents']]
tasks = [Task(**task_config) for task_config in crew['tasks']]
my_crew = Crew(agents=agents, tasks=tasks, process=crew['process'])
```

### Adapter Features

- ✅ **Agent mapping** - Convert agent configs to framework-specific formats
- ✅ **Workflow mapping** - Convert multi-agent workflows with connections
- ✅ **Tool conversion** - Map tools to framework-specific tool definitions
- ✅ **Memory mapping** - Convert memory configurations
- ✅ **Parameter mapping** - Translate model parameters across frameworks
- ✅ **Credential handling** - Manage API credentials appropriately

## 📚 API Reference

### Agent Validation

#### `validateAgentConfig(config: unknown): ValidationResult`

Safely validates an agent configuration.

```typescript
import { validateAgentConfig } from '@ai-agent/schema';

const result = validateAgentConfig(config);
if (result.success) {
  // Use result.data (typed as AgentConfig)
} else {
  // Handle result.error
}
```

#### `validateAgentConfigStrict(config: unknown): AgentConfig`

Validates and throws on error.

```typescript
import { validateAgentConfigStrict } from '@ai-agent/schema';

try {
  const validConfig = validateAgentConfigStrict(config);
} catch (error) {
  console.error('Validation failed:', error);
}
```

### Workflow Validation

#### `validateWorkflowConfig(workflow: unknown): WorkflowValidationResult`

Validates a workflow configuration with multiple connected agents.

```typescript

#### `detectWorkflowCycles(workflow: WorkflowConfig): boolean`

Detects if a workflow has circular dependencies.

```typescript
import { detectWorkflowCycles } from '@ai-agent/schema';

const hasCycles = detectWorkflowCycles(workflow);
if (hasCycles) {
  console.warn('Workflow has circular dependencies');
}
```

#### `getWorkflowTopologicalOrder(workflow: WorkflowConfig): string[] | null`

Gets the execution order of nodes in a workflow.

```typescript
import { getWorkflowTopologicalOrder } from '@ai-agent/schema';

const order = getWorkflowTopologicalOrder(workflow);
if (order) {
  console.log('Execute nodes in order:', order);
}
```

## 🧪 Examples

See the [examples](./examples) directory for more usage examples:

**Agent Examples:**
- Basic agent configuration
- Agent with tools and memory
- JSON Schema generation

**Workflow Examples:**
- Simple linear workflow
- Complex multi-agent workflow
- Scheduled workflow with variables

**Adapter Examples:**
- n8n customer support workflow
- LangChain research pipeline
- CrewAI content creation crew

## 🗺️ Roadmap

- [x] **Phase 1**: Core schema + validator ✅
- [x] **Phase 2**: Framework adapters (n8n, LangChain, CrewAI) ✅
- [x] **Phase 3**: Workflow schema for multi-agent systems ✅
- [ ] **Phase 4**: UI schema integration examples
- [ ] **Phase 5**: Plugin ecosystem

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Setting up your development environment
- Running tests and linting
- Code style guidelines
- Submitting pull requests

## 📄 License

MIT © Shaun Ganley

## 🔗 Links

- [Documentation](https://github.com/yourusername/ai-agent-schema)
- [Issue Tracker](https://github.com/yourusername/ai-agent-schema/issues)
- [NPM Package](https://www.npmjs.com/package/@ai-agent/schema)

---

Built with ❤️ for the AI agent community
