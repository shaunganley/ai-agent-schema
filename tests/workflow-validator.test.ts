/**
 * Tests for workflow validator utilities
 */
import { describe, it, expect } from 'vitest';
import {
  validateWorkflowConfig,
  validateWorkflowConfigStrict,
  detectWorkflowCycles,
  getWorkflowTopologicalOrder,
  findDisconnectedNodes,
} from '../src/utils/workflow-validator';
import type { WorkflowConfig } from '../src/types/workflow';

describe('validateWorkflowConfig', () => {
  it('should validate a minimal valid workflow', () => {
    const workflow = {
      id: 'workflow1',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          type: 'agent' as const,
          agentId: 'agent1',
        },
      ],
      connections: [],
    };

    const result = validateWorkflowConfig(workflow);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(workflow);
  });

  it('should validate a complete workflow with multiple nodes', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Research Workflow',
      description: 'A workflow for research tasks',
      version: '1.0.0',
      nodes: [
        {
          id: 'node1',
          type: 'agent',
          agentId: 'research-agent',
          position: { x: 100, y: 100 },
        },
        {
          id: 'node2',
          type: 'agent',
          agentId: 'summary-agent',
          position: { x: 300, y: 100 },
        },
        {
          id: 'node3',
          type: 'end',
          position: { x: 500, y: 100 },
        },
      ],
      connections: [
        {
          id: 'conn1',
          sourceId: 'node1',
          targetId: 'node2',
          label: 'Research Complete',
        },
        {
          id: 'conn2',
          sourceId: 'node2',
          targetId: 'node3',
        },
      ],
      trigger: {
        type: 'manual',
      },
      variables: [
        {
          name: 'topic',
          type: 'string',
          required: true,
          description: 'Research topic',
        },
      ],
      tags: ['research', 'ai'],
    };

    const result = validateWorkflowConfig(workflow);
    expect(result.success).toBe(true);
    expect(result.data?.nodes.length).toBe(3);
    expect(result.data?.connections.length).toBe(2);
  });

  it('should fail validation for missing required fields', () => {
    const workflow = {
      name: 'Test Workflow',
      nodes: [],
    };

    const result = validateWorkflowConfig(workflow);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues).toBeDefined();
  });

  it('should fail validation for empty nodes array', () => {
    const workflow = {
      id: 'workflow1',
      name: 'Test Workflow',
      nodes: [],
      connections: [],
    };

    const result = validateWorkflowConfig(workflow);
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('validation failed');
  });

  it('should fail validation for invalid connection references', () => {
    const workflow = {
      id: 'workflow1',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          type: 'agent' as const,
          agentId: 'agent1',
        },
      ],
      connections: [
        {
          id: 'conn1',
          sourceId: 'node1',
          targetId: 'nonexistent', // Invalid reference
        },
      ],
    };

    const result = validateWorkflowConfig(workflow);
    expect(result.success).toBe(false);
  });

  it('should fail validation for agent node without agentId or agent config', () => {
    const workflow = {
      id: 'workflow1',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          type: 'agent' as const,
          // Missing agentId and agent
        },
      ],
      connections: [],
    };

    const result = validateWorkflowConfig(workflow);
    expect(result.success).toBe(false);
  });

  it('should validate workflow with inline agent configuration', () => {
    const workflow = {
      id: 'workflow1',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          type: 'agent' as const,
          agent: {
            id: 'agent1',
            name: 'Test Agent',
            provider: 'openai' as const,
            model: 'gpt-4',
          },
        },
      ],
      connections: [],
    };

    const result = validateWorkflowConfig(workflow);
    expect(result.success).toBe(true);
  });

  it('should validate different trigger types', () => {
    const triggerTypes = ['manual', 'schedule', 'webhook', 'event'] as const;

    triggerTypes.forEach((triggerType) => {
      const workflow = {
        id: 'workflow1',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node1',
            type: 'agent' as const,
            agentId: 'agent1',
          },
        ],
        connections: [],
        trigger: {
          type: triggerType,
        },
      };

      const result = validateWorkflowConfig(workflow);
      expect(result.success).toBe(true);
    });
  });
});

describe('validateWorkflowConfigStrict', () => {
  it('should return validated config on success', () => {
    const workflow = {
      id: 'workflow1',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          type: 'agent' as const,
          agentId: 'agent1',
        },
      ],
      connections: [],
    };

    const validated = validateWorkflowConfigStrict(workflow);
    expect(validated).toEqual(workflow);
  });

  it('should throw on validation failure', () => {
    const workflow = {
      name: 'Test Workflow',
      nodes: [],
    };

    expect(() => validateWorkflowConfigStrict(workflow)).toThrow();
  });
});

describe('detectWorkflowCycles', () => {
  it('should return false for workflow without cycles', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Linear Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
        { id: 'node3', type: 'agent', agentId: 'agent3' },
      ],
      connections: [
        { id: 'conn1', sourceId: 'node1', targetId: 'node2' },
        { id: 'conn2', sourceId: 'node2', targetId: 'node3' },
      ],
    };

    expect(detectWorkflowCycles(workflow)).toBe(false);
  });

  it('should return true for workflow with simple cycle', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Cyclic Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
      ],
      connections: [
        { id: 'conn1', sourceId: 'node1', targetId: 'node2' },
        { id: 'conn2', sourceId: 'node2', targetId: 'node1' }, // Cycle
      ],
    };

    expect(detectWorkflowCycles(workflow)).toBe(true);
  });

  it('should return true for workflow with complex cycle', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Complex Cyclic Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
        { id: 'node3', type: 'agent', agentId: 'agent3' },
      ],
      connections: [
        { id: 'conn1', sourceId: 'node1', targetId: 'node2' },
        { id: 'conn2', sourceId: 'node2', targetId: 'node3' },
        { id: 'conn3', sourceId: 'node3', targetId: 'node1' }, // Cycle
      ],
    };

    expect(detectWorkflowCycles(workflow)).toBe(true);
  });

  it('should return false for disconnected DAG', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Disconnected Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
        { id: 'node3', type: 'agent', agentId: 'agent3' },
        { id: 'node4', type: 'agent', agentId: 'agent4' },
      ],
      connections: [
        { id: 'conn1', sourceId: 'node1', targetId: 'node2' },
        { id: 'conn2', sourceId: 'node3', targetId: 'node4' },
      ],
    };

    expect(detectWorkflowCycles(workflow)).toBe(false);
  });
});

describe('getWorkflowTopologicalOrder', () => {
  it('should return correct order for linear workflow', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Linear Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
        { id: 'node3', type: 'agent', agentId: 'agent3' },
      ],
      connections: [
        { id: 'conn1', sourceId: 'node1', targetId: 'node2' },
        { id: 'conn2', sourceId: 'node2', targetId: 'node3' },
      ],
    };

    const order = getWorkflowTopologicalOrder(workflow);
    expect(order).toEqual(['node1', 'node2', 'node3']);
  });

  it('should return null for workflow with cycles', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Cyclic Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
      ],
      connections: [
        { id: 'conn1', sourceId: 'node1', targetId: 'node2' },
        { id: 'conn2', sourceId: 'node2', targetId: 'node1' },
      ],
    };

    const order = getWorkflowTopologicalOrder(workflow);
    expect(order).toBeNull();
  });

  it('should handle workflow with multiple valid orders', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Parallel Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
        { id: 'node3', type: 'agent', agentId: 'agent3' },
        { id: 'node4', type: 'agent', agentId: 'agent4' },
      ],
      connections: [
        { id: 'conn1', sourceId: 'node1', targetId: 'node3' },
        { id: 'conn2', sourceId: 'node2', targetId: 'node4' },
      ],
    };

    const order = getWorkflowTopologicalOrder(workflow);
    expect(order).not.toBeNull();
    expect(order?.length).toBe(4);
    // node1 and node2 should come before node3 and node4 respectively
    const idx1 = order?.indexOf('node1') ?? -1;
    const idx2 = order?.indexOf('node2') ?? -1;
    const idx3 = order?.indexOf('node3') ?? -1;
    const idx4 = order?.indexOf('node4') ?? -1;
    expect(idx1).toBeLessThan(idx3);
    expect(idx2).toBeLessThan(idx4);
  });
});

describe('findDisconnectedNodes', () => {
  it('should return empty array for fully connected workflow', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Connected Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
      ],
      connections: [{ id: 'conn1', sourceId: 'node1', targetId: 'node2' }],
    };

    const disconnected = findDisconnectedNodes(workflow);
    expect(disconnected).toEqual([]);
  });

  it('should find single disconnected node', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Partially Connected Workflow',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
        { id: 'node3', type: 'agent', agentId: 'agent3' },
      ],
      connections: [{ id: 'conn1', sourceId: 'node1', targetId: 'node2' }],
    };

    const disconnected = findDisconnectedNodes(workflow);
    expect(disconnected).toEqual(['node3']);
  });

  it('should find multiple disconnected nodes', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'Multiple Disconnected',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
        { id: 'node3', type: 'agent', agentId: 'agent3' },
        { id: 'node4', type: 'agent', agentId: 'agent4' },
      ],
      connections: [{ id: 'conn1', sourceId: 'node1', targetId: 'node2' }],
    };

    const disconnected = findDisconnectedNodes(workflow);
    expect(disconnected).toContain('node3');
    expect(disconnected).toContain('node4');
    expect(disconnected.length).toBe(2);
  });

  it('should return all nodes for workflow with no connections', () => {
    const workflow: WorkflowConfig = {
      id: 'workflow1',
      name: 'No Connections',
      nodes: [
        { id: 'node1', type: 'agent', agentId: 'agent1' },
        { id: 'node2', type: 'agent', agentId: 'agent2' },
      ],
      connections: [],
    };

    const disconnected = findDisconnectedNodes(workflow);
    expect(disconnected).toEqual(['node1', 'node2']);
  });
});
