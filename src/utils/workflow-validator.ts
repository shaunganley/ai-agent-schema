/**
 * Validation utilities for Workflow configurations
 */
import { ZodError } from 'zod';
import { WorkflowConfigSchema } from '../schemas/workflow.schema.js';
import type { WorkflowConfig } from '../types/workflow.js';
import type { WorkflowValidationResult } from '../types/workflow.js';

/**
 * Validates a workflow configuration against the schema
 *
 * @param config - The workflow configuration to validate
 * @returns Validation result with success status and data or error
 *
 * @example
 * ```ts
 * const result = validateWorkflowConfig({
 *   id: 'workflow1',
 *   name: 'My Workflow',
 *   nodes: [...],
 *   connections: [...]
 * });
 *
 * if (result.success) {
 *   console.log('Valid workflow:', result.data);
 * } else {
 *   console.error('Validation failed:', result.error);
 * }
 * ```
 */
export function validateWorkflowConfig(
  config: unknown
): WorkflowValidationResult {
  try {
    const validatedData = WorkflowConfigSchema.parse(config);
    return {
      success: true,
      data: validatedData as WorkflowConfig,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          message: 'Workflow validation failed',
          issues: error.errors.map((issue) => ({
            path: issue.path.map(String),
            message: issue.message,
          })),
        },
      };
    }
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Unknown validation error',
      },
    };
  }
}

/**
 * Validates a workflow configuration and throws on failure
 *
 * @param config - The workflow configuration to validate
 * @returns The validated workflow configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```ts
 * try {
 *   const workflow = validateWorkflowConfigStrict({
 *     id: 'workflow1',
 *     name: 'My Workflow',
 *     nodes: [...],
 *     connections: [...]
 *   });
 *   // Use workflow...
 * } catch (error) {
 *   console.error('Invalid workflow:', error);
 * }
 * ```
 */
export function validateWorkflowConfigStrict(config: unknown): WorkflowConfig {
  return WorkflowConfigSchema.parse(config) as WorkflowConfig;
}

/**
 * Checks if a workflow has circular dependencies
 *
 * @param workflow - The workflow configuration to check
 * @returns True if the workflow has cycles, false otherwise
 *
 * @example
 * ```ts
 * const hasCycle = detectWorkflowCycles(workflow);
 * if (hasCycle) {
 *   console.warn('Workflow has circular dependencies');
 * }
 * ```
 */
export function detectWorkflowCycles(workflow: WorkflowConfig): boolean {
  const graph = new Map<string, Set<string>>();

  // Build adjacency list
  workflow.nodes.forEach((node) => {
    graph.set(node.id, new Set());
  });

  workflow.connections.forEach((conn) => {
    graph.get(conn.sourceId)?.add(conn.targetId);
  });

  // DFS to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Gets the topological order of nodes in a workflow (for execution planning)
 *
 * @param workflow - The workflow configuration
 * @returns Array of node IDs in topological order, or null if cycles detected
 *
 * @example
 * ```ts
 * const order = getWorkflowTopologicalOrder(workflow);
 * if (order) {
 *   console.log('Execution order:', order);
 * } else {
 *   console.error('Cannot order - workflow has cycles');
 * }
 * ```
 */
export function getWorkflowTopologicalOrder(
  workflow: WorkflowConfig
): string[] | null {
  if (detectWorkflowCycles(workflow)) {
    return null;
  }

  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  // Initialize
  workflow.nodes.forEach((node) => {
    graph.set(node.id, new Set());
    inDegree.set(node.id, 0);
  });

  // Build graph and calculate in-degrees
  workflow.connections.forEach((conn) => {
    graph.get(conn.sourceId)?.add(conn.targetId);
    inDegree.set(conn.targetId, (inDegree.get(conn.targetId) || 0) + 1);
  });

  // Kahn's algorithm
  const queue: string[] = [];
  const result: string[] = [];

  // Add nodes with no incoming edges
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    const neighbors = graph.get(nodeId) || new Set();
    neighbors.forEach((neighbor) => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result.length === workflow.nodes.length ? result : null;
}

/**
 * Finds disconnected nodes in a workflow
 *
 * @param workflow - The workflow configuration
 * @returns Array of node IDs that are not connected to any other nodes
 *
 * @example
 * ```ts
 * const disconnected = findDisconnectedNodes(workflow);
 * if (disconnected.length > 0) {
 *   console.warn('Disconnected nodes:', disconnected);
 * }
 * ```
 */
export function findDisconnectedNodes(workflow: WorkflowConfig): string[] {
  const connectedNodes = new Set<string>();

  workflow.connections.forEach((conn) => {
    connectedNodes.add(conn.sourceId);
    connectedNodes.add(conn.targetId);
  });

  return workflow.nodes
    .map((node) => node.id)
    .filter((id) => !connectedNodes.has(id));
}
