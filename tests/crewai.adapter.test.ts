/**
 * Tests for CrewAI adapter
 */

import { describe, it, expect } from 'vitest';
import {
  mapAgentToCrewAgent,
  mapWorkflowToCrew,
} from '../src/adapters/crewai.adapter';
import type { AgentConfig } from '../src/types/agent';
import type { WorkflowConfig } from '../src/types/workflow';

describe('CrewAI Adapter', () => {
  describe('mapAgentToCrewAgent', () => {
    it('should convert basic agent to CrewAI format', () => {
      const agent: AgentConfig = {
        id: 'agent1',
        name: 'Research Specialist',
        description: 'Expert in conducting research',
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'You are a thorough researcher',
      };

      const crewAgent = mapAgentToCrewAgent(agent);

      expect(crewAgent.role).toBe('Research Specialist');
      expect(crewAgent.goal).toBe('You are a thorough researcher');
      expect(crewAgent.backstory).toContain('Expert in conducting research');
      expect(crewAgent.llm?.model).toContain('gpt-4');
    });

    it('should generate role and goal from minimal config', () => {
      const agent: AgentConfig = {
        id: 'agent2',
        name: 'Writer',
        provider: 'anthropic',
        model: 'claude-3-opus',
      };

      const crewAgent = mapAgentToCrewAgent(agent);

      expect(crewAgent.role).toBe('Writer');
      expect(crewAgent.goal).toContain('Writer');
      expect(crewAgent.backstory).toBeDefined();
    });

    it('should map tools correctly', () => {
      const agent: AgentConfig = {
        id: 'agent3',
        name: 'Tool User',
        provider: 'openai',
        model: 'gpt-4',
        tools: [
          {
            id: 'tool1',
            name: 'search_tool',
            description: 'Search the internet',
          },
          {
            id: 'tool2',
            name: 'file_tool',
            description: 'Read files',
          },
        ],
      };

      const crewAgent = mapAgentToCrewAgent(agent);

      expect(crewAgent.tools).toBeDefined();
      expect(crewAgent.tools).toHaveLength(2);
      expect(crewAgent.tools).toContain('search_tool');
      expect(crewAgent.tools).toContain('file_tool');
    });

    it('should map model parameters', () => {
      const agent: AgentConfig = {
        id: 'agent4',
        name: 'Param Agent',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        parameters: {
          temperature: 0.2,
          maxTokens: 800,
          topP: 0.85,
        },
      };

      const crewAgent = mapAgentToCrewAgent(agent);

      expect(crewAgent.llm?.temperature).toBe(0.2);
      expect(crewAgent.llm?.maxTokens).toBe(800);
      expect(crewAgent.llm?.topP).toBe(0.85);
    });

    it('should handle memory configuration', () => {
      const agent: AgentConfig = {
        id: 'agent5',
        name: 'Memory Agent',
        provider: 'openai',
        model: 'gpt-4',
        memory: {
          type: 'buffer',
          maxMessages: 10,
        },
      };

      const crewAgent = mapAgentToCrewAgent(agent, { enableMemory: true });

      expect(crewAgent.memory).toBe(true);
    });

    it('should disable memory when agent has no memory config', () => {
      const agent: AgentConfig = {
        id: 'agent6',
        name: 'No Memory Agent',
        provider: 'openai',
        model: 'gpt-4',
        memory: {
          type: 'none',
        },
      };

      const crewAgent = mapAgentToCrewAgent(agent, { enableMemory: true });

      expect(crewAgent.memory).toBe(false);
    });

    it('should apply adapter options', () => {
      const agent: AgentConfig = {
        id: 'agent7',
        name: 'Options Agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const crewAgent = mapAgentToCrewAgent(agent, {
        verbose: true,
        enableMemory: false,
        enableCache: false,
      });

      expect(crewAgent.verbose).toBe(true);
      expect(crewAgent.memory).toBe(false);
      expect(crewAgent.cache).toBe(false);
    });

    it('should set default CrewAI properties', () => {
      const agent: AgentConfig = {
        id: 'agent8',
        name: 'Default Agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const crewAgent = mapAgentToCrewAgent(agent);

      expect(crewAgent.allowDelegation).toBe(true);
      expect(crewAgent.maxIter).toBe(15);
    });
  });

  describe('mapWorkflowToCrew', () => {
    it('should convert simple sequential workflow', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow1',
        name: 'Research and Write',
        nodes: [
          {
            id: 'researcher',
            type: 'agent' as const,
            agent: {
              id: 'researcher',
              name: 'Researcher',
              provider: 'openai' as const,
              model: 'gpt-4',
              systemPrompt: 'Conduct research',
            },
          },
          {
            id: 'writer',
            type: 'agent' as const,
            agent: {
              id: 'writer',
              name: 'Writer',
              provider: 'openai' as const,
              model: 'gpt-4',
              systemPrompt: 'Write content',
            },
          },
        ],
        connections: [{ id: 'c1', sourceId: 'researcher', targetId: 'writer' }],
      };

      const crew = mapWorkflowToCrew(workflow);

      expect(crew.name).toBe('Research and Write');
      expect(crew.agents.length).toBe(2);
      expect(crew.tasks.length).toBe(2);
      expect(crew.process).toBe('sequential');
    });

    it('should create tasks with correct context dependencies', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow2',
        name: 'Multi-Step Workflow',
        nodes: [
          {
            id: 'step1',
            type: 'agent',
            agent: {
              id: 'step1',
              name: 'Step 1 Agent',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
          {
            id: 'step2',
            type: 'agent',
            agent: {
              id: 'step2',
              name: 'Step 2 Agent',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
          {
            id: 'step3',
            type: 'agent',
            agent: {
              id: 'step3',
              name: 'Step 3 Agent',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
        ],
        connections: [
          { id: 'c1', sourceId: 'step1', targetId: 'step2' },
          { id: 'c2', sourceId: 'step2', targetId: 'step3' },
        ],
      };

      const crew = mapWorkflowToCrew(workflow);

      // Check that tasks have correct context dependencies
      const task2 = crew.tasks.find((t) => t.agent === 'Step 2 Agent');
      expect(task2?.context).toContain('step1');

      const task3 = crew.tasks.find((t) => t.agent === 'Step 3 Agent');
      expect(task3?.context).toContain('step2');
    });

    it('should use hierarchical process for branching workflows', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow3',
        name: 'Branching Workflow',
        nodes: [
          {
            id: 'agent1',
            type: 'agent',
            agent: {
              id: 'agent1',
              name: 'Main Agent',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
          {
            id: 'agent2',
            type: 'agent',
            agent: {
              id: 'agent2',
              name: 'Branch A',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
          {
            id: 'agent3',
            type: 'agent',
            agent: {
              id: 'agent3',
              name: 'Branch B',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
        ],
        connections: [
          { id: 'c1', sourceId: 'agent1', targetId: 'agent2' },
          { id: 'c2', sourceId: 'agent1', targetId: 'agent3' },
        ],
      };

      const crew = mapWorkflowToCrew(workflow);

      expect(crew.process).toBe('hierarchical');
    });

    it('should skip non-agent nodes', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow4',
        name: 'Mixed Node Workflow',
        nodes: [
          { id: 'start', type: 'trigger' },
          {
            id: 'agent1',
            type: 'agent',
            agent: {
              id: 'agent1',
              name: 'Worker',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
          { id: 'end', type: 'end' },
        ],
        connections: [
          { id: 'c1', sourceId: 'start', targetId: 'agent1' },
          { id: 'c2', sourceId: 'agent1', targetId: 'end' },
        ],
      };

      const crew = mapWorkflowToCrew(workflow);

      // Should only have 1 agent (non-agent nodes are skipped)
      expect(crew.agents.length).toBe(1);
      expect(crew.tasks.length).toBe(1);
    });

    it('should apply workflow-level options', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow5',
        name: 'Options Workflow',
        nodes: [
          {
            id: 'agent1',
            type: 'agent',
            agent: {
              id: 'agent1',
              name: 'Agent',
              provider: 'openai',
              model: 'gpt-4',
            },
          },
        ],
        connections: [],
      };

      const crew = mapWorkflowToCrew(workflow, {
        process: 'hierarchical',
        verbose: true,
        enableMemory: true,
        enableCache: true,
        maxRpm: 20,
      });

      expect(crew.process).toBe('hierarchical');
      expect(crew.verbose).toBe(true);
      expect(crew.memory).toBe(true);
      expect(crew.cache).toBe(true);
      expect(crew.maxRpm).toBe(20);
    });

    it('should include tools in tasks', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow6',
        name: 'Tools Workflow',
        nodes: [
          {
            id: 'agent1',
            type: 'agent',
            agent: {
              id: 'agent1',
              name: 'Tool User',
              provider: 'openai',
              model: 'gpt-4',
              tools: [
                {
                  id: 'tool1',
                  name: 'search',
                  description: 'Search tool',
                },
                {
                  id: 'tool2',
                  name: 'calculator',
                  description: 'Math tool',
                },
              ],
            },
          },
        ],
        connections: [],
      };

      const crew = mapWorkflowToCrew(workflow);

      expect(crew.tasks[0].tools).toBeDefined();
      expect(crew.tasks[0].tools?.length).toBe(2);
      expect(crew.tasks[0].tools).toContain('search');
      expect(crew.tasks[0].tools).toContain('calculator');
    });

    it('should handle empty workflows gracefully', () => {
      const workflow: WorkflowConfig = {
        id: 'workflow7',
        name: 'Empty Workflow',
        nodes: [],
        connections: [],
      };

      const crew = mapWorkflowToCrew(workflow);

      expect(crew.agents.length).toBe(0);
      expect(crew.tasks.length).toBe(0);
    });
  });
});
