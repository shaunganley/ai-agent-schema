/**
 * Zod schemas for Workflow validation
 */
import { z } from 'zod';
import { AgentConfigSchema } from './agent.schema.js';

/**
 * Node position schema
 */
export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/**
 * Workflow connection schema
 */
export const WorkflowConnectionSchema = z.object({
  id: z.string().min(1, 'Connection ID is required'),
  sourceId: z.string().min(1, 'Source ID is required'),
  targetId: z.string().min(1, 'Target ID is required'),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  condition: z.string().optional(),
  label: z.string().optional(),
});

/**
 * Workflow node schema
 */
export const WorkflowNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  type: z.enum(['agent', 'trigger', 'condition', 'loop', 'end']),
  agentId: z.string().optional(),
  agent: AgentConfigSchema.optional(),
  position: NodePositionSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Workflow trigger schema
 */
export const WorkflowTriggerSchema = z.object({
  type: z.enum(['manual', 'schedule', 'webhook', 'event']),
  config: z
    .object({
      schedule: z.string().optional(),
      webhookUrl: z.string().url().optional(),
      eventName: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

/**
 * Workflow variable schema
 */
export const WorkflowVariableSchema = z.object({
  name: z.string().min(1, 'Variable name is required'),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  defaultValue: z.unknown().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

/**
 * Complete workflow configuration schema
 */
export const WorkflowConfigSchema = z
  .object({
    id: z.string().min(1, 'Workflow ID is required'),
    name: z.string().min(1, 'Workflow name is required'),
    description: z.string().optional(),
    version: z.string().optional(),
    nodes: z.array(WorkflowNodeSchema).min(1, 'At least one node is required'),
    connections: z.array(WorkflowConnectionSchema),
    trigger: WorkflowTriggerSchema.optional(),
    variables: z.array(WorkflowVariableSchema).optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine(
    (workflow) => {
      // Validate that connections reference existing nodes
      const nodeIds = new Set(workflow.nodes.map((n) => n.id));
      return workflow.connections.every(
        (conn) => nodeIds.has(conn.sourceId) && nodeIds.has(conn.targetId)
      );
    },
    {
      message: 'All connections must reference existing nodes',
      path: ['connections'],
    }
  )
  .refine(
    (workflow) => {
      // Validate that agent nodes have either agentId or agent config
      return workflow.nodes
        .filter((n) => n.type === 'agent')
        .every((n) => n.agentId || n.agent);
    },
    {
      message: 'Agent nodes must have either agentId or agent configuration',
      path: ['nodes'],
    }
  );

/**
 * Type inference from Zod schemas
 */
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;
export type WorkflowConnection = z.infer<typeof WorkflowConnectionSchema>;
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;
export type WorkflowVariable = z.infer<typeof WorkflowVariableSchema>;
export type NodePosition = z.infer<typeof NodePositionSchema>;
