/**
 * Tests for LangChain adapter
 */

import { describe, it, expect } from 'vitest';
import {
  mapAgentToLangChain,
  mapWorkflowToLangGraph,
} from '../src/adapters/langchain.adapter';
import type { AgentConfig } from '../src/types/agent';
import type { WorkflowConfig } from '../src/types/workflow';

describe('LangChain Adapter', () => {
  describe('mapAgentToLangChain', () => {
    it('should convert basic agent to LangChain format', () => {
      const agent: AgentConfig = {
        id: 'agent1',
        name: 'Research Agent',
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'You are a research assistant',
      };

      const lcAgent = mapAgentToLangChain(agent);

      expect(lcAgent.llm.modelName).toContain('gpt-4');
      expect(lcAgent.systemMessage).toBe('You are a research assistant');
      expect(lcAgent.agentType).toBeDefined();
      expect(lcAgent.tools).toEqual([]);
    });

    it('should map tools correctly', () => {
      const agent: AgentConfig = {
        id: 'agent2',
        name: 'Tool Agent',
        provider: 'openai',
        model: 'gpt-4',
        tools: [
          {
            id: 'tool1',
            name: 'search',
            description: 'Search the web',
            parameters: { query: 'string' },
          },
          {
            id: 'tool2',
            name: 'calculator',
            description: 'Perform math calculations',
          },
        ],
      };

      const lcAgent = mapAgentToLangChain(agent);

      expect(lcAgent.tools.length).toBe(2);
      expect(lcAgent.tools[0].name).toBe('search');
      expect(lcAgent.tools[0].description).toBe('Search the web');
      expect(lcAgent.tools[1].name).toBe('calculator');
      expect(lcAgent.agentType).toContain('function'); // Should use OpenAI functions
    });

    it('should map memory configuration', () => {
      const agent: AgentConfig = {
        id: 'agent3',
        name: 'Memory Agent',
        provider: 'anthropic',
        model: 'claude-3-opus',
        memory: {
          type: 'buffer',
          maxMessages: 5,
        },
      };

      const lcAgent = mapAgentToLangChain(agent);

      expect(lcAgent.memory).toBeDefined();
      expect(lcAgent.memory?.type).toBe('buffer');
      expect(lcAgent.memory?.config?.k).toBe(5);
      expect(lcAgent.memory?.config?.returnMessages).toBe(true);
    });

    it('should map model parameters', () => {
      const agent: AgentConfig = {
        id: 'agent4',
        name: 'Param Agent',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        parameters: {
          temperature: 0.3,
          maxTokens: 500,
          topP: 0.8,
          frequencyPenalty: 0.5,
          presencePenalty: 0.5,
        },
      };

      const lcAgent = mapAgentToLangChain(agent);

      expect(lcAgent.llm.temperature).toBe(0.3);
      expect(lcAgent.llm.maxTokens).toBe(500);
      expect(lcAgent.llm.topP).toBe(0.8);
      expect(lcAgent.llm.frequencyPenalty).toBe(0.5);
      expect(lcAgent.llm.presencePenalty).toBe(0.5);
    });

    it('should apply adapter options', () => {
      const agent: AgentConfig = {
        id: 'agent5',
        name: 'Options Agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const lcAgent = mapAgentToLangChain(agent, {
        verbose: true,
        maxIterations: 20,
        returnIntermediateSteps: true,
      });

      expect(lcAgent.verbose).toBe(true);
      expect(lcAgent.maxIterations).toBe(20);
      expect(lcAgent.returnIntermediateSteps).toBe(true);
    });

    it('should use conversational agent type for memory-enabled agents', () => {
      const agent: AgentConfig = {
        id: 'agent6',
        name: 'Conversational Agent',
        provider: 'openai',
        model: 'gpt-4',
        memory: {
          type: 'summary',
        },
      };

      const lcAgent = mapAgentToLangChain(agent);

      expect(lcAgent.agentType).toContain('conversational');
    });
  });

  describe('mapWorkflowToLangGraph', () => {
    it('should convert simple workflow to LangGraph', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow1',
        name: 'Simple Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'agent1', type: 'agent', agentId: 'research' },
          { id: 'end', type: 'end' },
        ],
        connections: [
          { id: 'c1', sourceId: 'start', targetId: 'agent1' },
          { id: 'c2', sourceId: 'agent1', targetId: 'end' },
        ],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(lgWorkflow.name).toBe('Simple Workflow');
      expect(Object.keys(lgWorkflow.nodes).length).toBe(3);
      expect(lgWorkflow.edges.length).toBe(2);
      expect(lgWorkflow.entryPoint).toBe('start');
    });

    it('should handle inline agent configurations', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow2',
        name: 'Inline Agent Workflow',
        nodes: [
          {
            id: 'agent1',
            type: 'agent',
            agent: {
              id: 'inline-agent',
              name: 'Inline Agent',
              provider: 'openai',
              model: 'gpt-4',
              systemPrompt: 'You are helpful',
            },
          },
        ],
        connections: [],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(lgWorkflow.nodes['agent1']).toBeDefined();
      expect(lgWorkflow.nodes['agent1'].type).toBe('agent');
      expect(lgWorkflow.nodes['agent1'].config.systemMessage).toBe(
        'You are helpful'
      );
    });

    it('should handle conditional routing', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow3',
        name: 'Conditional Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'condition', type: 'condition' },
          { id: 'agent1', type: 'agent', agentId: 'path-a' },
          { id: 'agent2', type: 'agent', agentId: 'path-b' },
        ],
        connections: [
          { id: 'c1', sourceId: 'start', targetId: 'condition' },
          {
            id: 'c2',
            sourceId: 'condition',
            targetId: 'agent1',
            condition: 'yes',
          },
          {
            id: 'c3',
            sourceId: 'condition',
            targetId: 'agent2',
            condition: 'no',
          },
        ],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(lgWorkflow.nodes['condition'].type).toBe('conditional');
      expect(typeof lgWorkflow.nodes['condition'].next).toBe('object');
      expect(Array.isArray(lgWorkflow.nodes['condition'].next)).toBe(false);
    });

    it('should handle parallel execution', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow4',
        name: 'Parallel Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'agent1', type: 'agent', agentId: 'parallel-a' },
          { id: 'agent2', type: 'agent', agentId: 'parallel-b' },
          { id: 'end', type: 'end' },
        ],
        connections: [
          { id: 'c1', sourceId: 'start', targetId: 'agent1' },
          { id: 'c2', sourceId: 'start', targetId: 'agent2' },
          { id: 'c3', sourceId: 'agent1', targetId: 'end' },
          { id: 'c4', sourceId: 'agent2', targetId: 'end' },
        ],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(Array.isArray(lgWorkflow.nodes['start'].next)).toBe(true);
      expect((lgWorkflow.nodes['start'].next as string[]).length).toBe(2);
    });

    it('should include workflow variables in state schema', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow5',
        name: 'Variable Workflow',
        nodes: [{ id: 'agent', type: 'agent', agentId: 'agent1' }],
        connections: [],
        variables: [
          {
            name: 'query',
            type: 'string',
            defaultValue: 'test query',
            required: true,
          },
          {
            name: 'count',
            type: 'number',
            defaultValue: 10,
          },
        ],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(lgWorkflow.state.schema.query).toBe('string');
      expect(lgWorkflow.state.schema.count).toBe('number');
      expect(lgWorkflow.state.default.query).toBe('test query');
      expect(lgWorkflow.state.default.count).toBe(10);
    });

    it('should create checkpointer configuration', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow6',
        name: 'Checkpoint Workflow',
        nodes: [{ id: 'agent', type: 'agent', agentId: 'agent1' }],
        connections: [],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(lgWorkflow.checkpointer).toBeDefined();
      expect(lgWorkflow.checkpointer?.type).toBe('memory');
    });

    it('should set correct entry point', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow7',
        name: 'Entry Point Workflow',
        nodes: [
          { id: 'trigger-node', type: 'trigger' },
          { id: 'agent', type: 'agent', agentId: 'agent1' },
        ],
        connections: [
          { id: 'c1', sourceId: 'trigger-node', targetId: 'agent' },
        ],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(lgWorkflow.entryPoint).toBe('trigger-node');
    });

    it('should handle loop nodes', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow8',
        name: 'Loop Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'loop', type: 'loop' },
          { id: 'agent', type: 'agent', agentId: 'processor' },
        ],
        connections: [
          { id: 'c1', sourceId: 'start', targetId: 'loop' },
          { id: 'c2', sourceId: 'loop', targetId: 'agent' },
        ],
      };

      const lgWorkflow = mapWorkflowToLangGraph(workflow);

      expect(lgWorkflow.nodes['loop'].type).toBe('tool');
      expect((lgWorkflow.nodes['loop'].config as any).name).toBe('loop');
    });
  });
});
