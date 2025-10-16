# 🧠 AI Agent Schema SDK — Product Requirements Document (PRD)

## 1. Overview

**Product Name:** AI Agent Schema
**Type:** Open Source TypeScript SDK
**Owner:** Shaun Ganley
**Repository Goal:**
To define a **standardized JSON schema** and **TypeScript interface** for describing AI agents, their configuration, and how they connect in workflows — enabling interoperability between AI agent frameworks (e.g. n8n, LangChain, CrewAI, Flowise).

---

## 2. Problem Statement

Today, every AI orchestration tool and agent framework defines its own structure for representing agents, tools, and workflows.
This fragmentation makes it difficult for:

* Developers to move agent definitions between tools
* Teams to document, validate, or share agent configurations
* Systems to dynamically generate or configure agents from metadata

There is **no common schema** or lightweight SDK that bridges this gap.

---

## 3. Vision

Create an **open, extensible JSON-based standard** and SDK for defining AI agents and workflows that:

* Can be **easily parsed and validated** using Zod or JSON Schema
* Supports **automated generation of UIs** for agent configuration
* Enables **cross-platform mapping** to popular frameworks
* Is **language-agnostic**, but TypeScript-first for adoption ease

---

## 4. Goals and Success Metrics

| Goal                                 | Success Metric                                                       |
| ------------------------------------ | -------------------------------------------------------------------- |
| Define a universal agent JSON schema | JSON Schema and Zod schema published                                 |
| Provide an importable SDK            | Published to npm as `@ai-agent-schema/schema`                               |
| Enable interoperability              | Working adapters for at least 2 frameworks (n8n, LangChain)          |
| Support runtime validation           | Zod + validator functions                                            |
| Allow auto-generated UIs             | JSON Schema export used by a form generator                          |
| Build community adoption             | 100+ GitHub stars or integration into at least 1 open source project |

---

## 5. Core Features

### 5.1 Agent Schema

* Standard structure for defining an AI agent:

  * ID, name, description
  * Model and provider
  * Parameters (temperature, max tokens)
  * Tools and memory settings
  * Connections to other agents (for workflow graph)

### 5.2 Workflow Schema (Phase 2)

* Define how multiple agents are connected via input/output relationships
* Compatible with DAG-like workflow engines (e.g., n8n, LangGraph)

### 5.3 Validation and Generation

* `validateAgentConfig(json)` → runtime validation using Zod
* `generateAgentJsonSchema()` → generates JSON Schema for UI tools

### 5.4 Framework Adapters

Adapters to translate the standardized JSON into native representations:

* `mapAgentToN8nNode(agent)`
* `mapAgentToLangChain(agent)` *(planned)*
* `mapAgentToCrewAI(agent)` *(planned)*

### 5.5 Developer SDK

* Importable TypeScript library (`@ai-agent-schema/schema`)
* Exports types, schemas, and utility functions
* Supports ES Modules and CommonJS

---

## 6. Technical Architecture

### Languages & Frameworks

* **Language:** TypeScript
* **Validation:** Zod
* **Schema Generation:** zod-to-json-schema
* **Build:** tsup
* **Testing:** Vitest
* **Linting:** ESLint + Prettier

### Folder Structure

```
src/
 ├── types/
 ├── schemas/
 ├── adapters/
 ├── utils/
 ├── index.ts
tests/
```

### Distribution

* Published on npm
* Versioned with semantic release
* CI/CD via GitHub Actions (build + lint + test + publish)

---

## 7. Future Roadmap

| Phase | Deliverable             | Description                                          |
| ----- | ----------------------- | ---------------------------------------------------- |
| **1** | Core schema + validator | Define core agent and schema validation ✅            |
| **2** | Adapters                | Add n8n, LangChain, and CrewAI adapters ✅            |
| **3** | Workflow schema         | Define workflows that connect agents ✅               |
| **4** | UI schema integration   | Build example form generator using JSON Schema       |
| **5** | Plugin ecosystem        | Allow providers to register new adapters dynamically |

---

## 8. Example Use Case

A developer creates a JSON file:

```json
{
  "id": "agent1",
  "name": "Research Agent",
  "provider": "openai",
  "model": "gpt-4o",
  "temperature": 0.7,
  "connections": ["agent2"]
}
```

Then imports the SDK:

```ts
import { validateAgentConfig, mapAgentToN8nNode } from "@ai-agent-schema/schema";

const agent = validateAgentConfig(agentJson);
const n8nNode = mapAgentToN8nNode(agent);
```

This allows instant translation into an executable node for n8n — or, in the future, any supported agent runtime.

---

## 9. Non-Functional Requirements

* Lightweight (<100KB bundle)
* Typed and tree-shakable
* Backward-compatible schema versioning
* Open source under MIT license

---

## 10. Risks & Dependencies

| Risk                              | Mitigation                                    |
| --------------------------------- | --------------------------------------------- |
| Competing schema standards emerge | Align with OpenDevin, LangChain Hub, etc.     |
| Provider APIs change              | Version adapters separately                   |
| Community adoption                | Start with strong developer docs and examples |
