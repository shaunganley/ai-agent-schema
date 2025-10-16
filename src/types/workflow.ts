/**
 * Workflow type definitions for AI Agent Schema
 */

import type { AgentConfig } from './agent.js';

/**
 * Node position in a visual workflow editor
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Connection/edge between workflow nodes
 */
export interface WorkflowConnection {
  /**
   * Unique identifier for this connection
   */
  id: string;

  /**
   * Source node (agent) ID
   */
  sourceId: string;

  /**
   * Target node (agent) ID
   */
  targetId: string;

  /**
   * Optional: Source output port/handle
   */
  sourceHandle?: string;

  /**
   * Optional: Target input port/handle
   */
  targetHandle?: string;

  /**
   * Optional: Condition for this connection to be used
   */
  condition?: string;

  /**
   * Optional: Label for the connection
   */
  label?: string;
}

/**
 * Workflow node representing an agent in the workflow
 */
export interface WorkflowNode {
  /**
   * Unique identifier for this node
   */
  id: string;

  /**
   * Type of node
   */
  type: 'agent' | 'trigger' | 'condition' | 'loop' | 'end';

  /**
   * Reference to the agent configuration
   * Required for 'agent' type nodes
   */
  agentId?: string;

  /**
   * Inline agent configuration (alternative to agentId reference)
   */
  agent?: AgentConfig;

  /**
   * Visual position in workflow editor
   */
  position?: NodePosition;

  /**
   * Additional node metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Trigger configuration for workflow execution
 */
export interface WorkflowTrigger {
  /**
   * Type of trigger
   */
  type: 'manual' | 'schedule' | 'webhook' | 'event';

  /**
   * Configuration specific to trigger type
   */
  config?: {
    /**
     * Cron expression for scheduled triggers
     */
    schedule?: string;

    /**
     * Webhook URL for webhook triggers
     */
    webhookUrl?: string;

    /**
     * Event name for event-based triggers
     */
    eventName?: string;

    /**
     * Additional trigger-specific configuration
     */
    [key: string]: unknown;
  };
}

/**
 * Variable definition for workflow
 */
export interface WorkflowVariable {
  /**
   * Variable name
   */
  name: string;

  /**
   * Variable type
   */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';

  /**
   * Default value
   */
  defaultValue?: unknown;

  /**
   * Description of the variable
   */
  description?: string;

  /**
   * Whether this variable is required
   */
  required?: boolean;
}

/**
 * Complete workflow configuration
 */
export interface WorkflowConfig {
  /**
   * Unique identifier for the workflow
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of the workflow's purpose
   */
  description?: string;

  /**
   * Version of the workflow
   */
  version?: string;

  /**
   * Workflow nodes (agents and control nodes)
   */
  nodes: WorkflowNode[];

  /**
   * Connections between nodes
   */
  connections: WorkflowConnection[];

  /**
   * Trigger configuration
   */
  trigger?: WorkflowTrigger;

  /**
   * Workflow variables
   */
  variables?: WorkflowVariable[];

  /**
   * Tags for categorization
   */
  tags?: string[];

  /**
   * Additional workflow metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow validation result
 */
export interface WorkflowValidationResult {
  /**
   * Whether validation passed
   */
  success: boolean;

  /**
   * Validated workflow data (if successful)
   */
  data?: WorkflowConfig;

  /**
   * Error details (if failed)
   */
  error?: {
    message: string;
    issues?: Array<{
      path: string[];
      message: string;
    }>;
  };
}

/**
 * Workflow execution context
 */
export interface WorkflowExecutionContext {
  /**
   * Execution ID
   */
  executionId: string;

  /**
   * Workflow ID
   */
  workflowId: string;

  /**
   * Input variables
   */
  variables: Record<string, unknown>;

  /**
   * Execution start time
   */
  startTime: Date;

  /**
   * Current node being executed
   */
  currentNodeId?: string;

  /**
   * Execution status
   */
  status: 'running' | 'completed' | 'failed' | 'paused';
}
