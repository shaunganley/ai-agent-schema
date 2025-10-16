/**
 * Tests for n8n adapter
 */

import { describe, it, expect } from 'vitest';
import {
  mapAgentToN8nNode,
  mapWorkflowToN8n,
} from '../src/adapters/n8n.adapter';
import type { AgentConfig } from '../src/types/agent';
import type { WorkflowConfig } from '../src/types/workflow';

describe('n8n Adapter', () => {
  describe('mapAgentToN8nNode', () => {
    it('should convert basic agent to n8n node', () => {
      const agent: AgentConfig = {
        id: 'agent1',
        name: 'Customer Support Agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const node = mapAgentToN8nNode(agent);

      expect(node.name).toBe('Customer Support Agent');
      expect(node.type).toBe('n8n-nodes-langchain.agent');
      expect(node.parameters.agentId).toBe('agent1');
      expect(node.parameters.model).toBe('gpt-4');
      expect(node.credentials).toBeDefined();
      expect(node.credentials?.['openAiApi']).toBeDefined();
    });

    it('should include system prompt and parameters', () => {
      const agent: AgentConfig = {
        id: 'agent2',
        name: 'Research Agent',
        provider: 'anthropic',
        model: 'claude-3-opus',
        systemPrompt: 'You are a research assistant',
        parameters: {
          temperature: 0.5,
          maxTokens: 2000,
          topP: 0.9,
        },
      };

      const node = mapAgentToN8nNode(agent);

      expect(node.parameters.systemPrompt).toBe('You are a research assistant');
      expect(node.parameters.temperature).toBe(0.5);
      expect(node.parameters.maxTokens).toBe(2000);
      expect(node.parameters.topP).toBe(0.9);
    });

    it('should include tools configuration', () => {
      const agent: AgentConfig = {
        id: 'agent3',
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
            description: 'Perform calculations',
          },
        ],
      };

      const node = mapAgentToN8nNode(agent);

      expect(node.parameters.tools).toBeDefined();
      expect(Array.isArray(node.parameters.tools)).toBe(true);
      expect((node.parameters.tools as any[]).length).toBe(2);
      expect((node.parameters.tools as any[])[0].name).toBe('search');
    });

    it('should include memory configuration', () => {
      const agent: AgentConfig = {
        id: 'agent4',
        name: 'Memory Agent',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        memory: {
          type: 'buffer',
          maxMessages: 10,
          persistent: true,
        },
      };

      const node = mapAgentToN8nNode(agent);

      expect(node.parameters.memory).toBeDefined();
      expect((node.parameters.memory as any).type).toBe('buffer');
      expect((node.parameters.memory as any).maxMessages).toBe(10);
    });

    it('should exclude credentials when option is false', () => {
      const agent: AgentConfig = {
        id: 'agent5',
        name: 'No Creds Agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const node = mapAgentToN8nNode(agent, { includeCredentials: false });

      expect(node.credentials).toBeUndefined();
    });

    it('should position nodes based on options', () => {
      const agent: AgentConfig = {
        id: 'agent6',
        name: 'Positioned Agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const node = mapAgentToN8nNode(agent, { startPosition: [100, 200] });

      expect(node.position).toEqual([100, 200]);
    });
  });

  describe('mapWorkflowToN8n', () => {
    it('should convert simple linear workflow', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow1',
        name: 'Simple Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'agent1', type: 'agent', agentId: 'support-agent' },
          { id: 'end', type: 'end' },
        ],
        connections: [
          { id: 'c1', sourceId: 'start', targetId: 'agent1' },
          { id: 'c2', sourceId: 'agent1', targetId: 'end' },
        ],
      };

      const n8nWorkflow = mapWorkflowToN8n(workflow);

      expect(n8nWorkflow.name).toBe('Simple Workflow');
      expect(n8nWorkflow.nodes.length).toBe(3);
      expect(n8nWorkflow.connections).toBeDefined();
      expect(Object.keys(n8nWorkflow.connections).length).toBeGreaterThan(0);
    });

    it('should handle workflow with inline agent configs', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow2',
        name: 'Inline Agent Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          {
            id: 'agent1',
            type: 'agent',
            agent: {
              id: 'inline-agent',
              name: 'Inline Agent',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
        ],
        connections: [{ id: 'c1', sourceId: 'start', targetId: 'agent1' }],
      };

      const n8nWorkflow = mapWorkflowToN8n(workflow);

      expect(n8nWorkflow.nodes.length).toBe(2);
      const agentNode = n8nWorkflow.nodes.find((n) =>
        n.name.includes('Inline Agent')
      );
      expect(agentNode).toBeDefined();
      expect(agentNode?.parameters.agentId).toBe('inline-agent');
    });

    it('should handle conditional nodes', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow3',
        name: 'Conditional Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'condition', type: 'condition' },
          { id: 'agent1', type: 'agent', agentId: 'agent1' },
          { id: 'agent2', type: 'agent', agentId: 'agent2' },
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

      const n8nWorkflow = mapWorkflowToN8n(workflow);

      expect(n8nWorkflow.nodes.length).toBe(4);
      const conditionNode = n8nWorkflow.nodes.find(
        (n) => n.type === 'n8n-nodes-base.if'
      );
      expect(conditionNode).toBeDefined();
    });

    it('should handle loop nodes', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow4',
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

      const n8nWorkflow = mapWorkflowToN8n(workflow);

      const loopNode = n8nWorkflow.nodes.find(
        (n) => n.type === 'n8n-nodes-base.splitInBatches'
      );
      expect(loopNode).toBeDefined();
    });

    it('should include workflow settings', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow5',
        name: 'Settings Workflow',
        nodes: [{ id: 'start', type: 'trigger' }],
        connections: [],
      };

      const n8nWorkflow = mapWorkflowToN8n(workflow, {
        workflowSettings: {
          executionOrder: 'v1',
          saveExecutionProgress: true,
        },
      });

      expect(n8nWorkflow.settings).toBeDefined();
      expect(n8nWorkflow.settings?.executionOrder).toBe('v1');
      expect(n8nWorkflow.settings?.saveExecutionProgress).toBe(true);
    });

    it('should handle webhook triggers', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow6',
        name: 'Webhook Workflow',
        trigger: {
          type: 'webhook',
          config: {
            webhookUrl: '/webhook/test',
          },
        },
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'agent', type: 'agent', agentId: 'handler' },
        ],
        connections: [{ id: 'c1', sourceId: 'start', targetId: 'agent' }],
      };

      const n8nWorkflow = mapWorkflowToN8n(workflow);

      const triggerNode = n8nWorkflow.nodes.find(
        (n) => n.type === 'n8n-nodes-base.webhook'
      );
      expect(triggerNode).toBeDefined();
      expect(triggerNode?.parameters.path).toBe('/webhook/test');
    });

    it('should handle scheduled triggers', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow7',
        name: 'Scheduled Workflow',
        trigger: {
          type: 'schedule',
          config: {
            schedule: '0 9 * * 1-5', // Weekdays at 9 AM
          },
        },
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'agent', type: 'agent', agentId: 'daily-task' },
        ],
        connections: [{ id: 'c1', sourceId: 'start', targetId: 'agent' }],
      };

      const n8nWorkflow = mapWorkflowToN8n(workflow);

      const triggerNode = n8nWorkflow.nodes.find(
        (n) => n.type === 'n8n-nodes-base.scheduleTrigger'
      );
      expect(triggerNode).toBeDefined();
      expect(triggerNode?.parameters.rule).toBe('0 9 * * 1-5');
    });

    it('should calculate node positions correctly', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow8',
        name: 'Positioned Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          { id: 'agent1', type: 'agent', agentId: 'a1' },
          { id: 'agent2', type: 'agent', agentId: 'a2' },
        ],
        connections: [
          { id: 'c1', sourceId: 'start', targetId: 'agent1' },
          { id: 'c2', sourceId: 'agent1', targetId: 'agent2' },
        ],
      };

      const n8nWorkflow = mapWorkflowToN8n(workflow, {
        startPosition: [100, 100],
        nodeSpacing: 300,
      });

      expect(n8nWorkflow.nodes[0].position[0]).toBe(100);
      expect(n8nWorkflow.nodes.some((n) => n.position[0] > 100)).toBe(true);
    });
  });
});
