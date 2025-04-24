/**
 * Update Workflow Tool
 * 
 * This tool updates an existing workflow in n8n.
 */

import { BaseWorkflowToolHandler } from './base-handler.js';
import { ToolCallResult, ToolDefinition } from '../../types/index.js';
import { N8nApiError } from '../../errors/index.js';

/**
 * Handler for the update_workflow tool
 */
export class UpdateWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   * 
   * @param args Tool arguments containing workflow updates
   * @returns Updated workflow information
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { name, newName, nodes, connections, active, tags } = args;
      
      if (!name) {
        throw new N8nApiError('Missing required parameter: name');
      }
      
      // Validate nodes if provided
      if (nodes && !Array.isArray(nodes)) {
        throw new N8nApiError('Parameter "nodes" must be an array');
      }
      
      // Validate connections if provided
      if (connections && typeof connections !== 'object') {
        throw new N8nApiError('Parameter "connections" must be an object');
      }
      
      // Get all workflows to find the one with matching name
      const workflows = await this.apiService.getWorkflows();
      const workflow = workflows.find(w => w.name === name);
      
      if (!workflow) {
        throw new N8nApiError(`Workflow with name "${name}" not found`);
      }
      
      // Prepare update object with changes
      const workflowData: Record<string, any> = { ...workflow };
      
      // Update fields if provided
      if (newName !== undefined) workflowData.name = newName;
      if (nodes !== undefined) workflowData.nodes = nodes;
      if (connections !== undefined) workflowData.connections = connections;
      if (active !== undefined) workflowData.active = active;
      if (tags !== undefined) workflowData.tags = tags;
      
      // Update the workflow
      const updatedWorkflow = await this.apiService.updateWorkflow(workflow.id, workflowData);
      
      // Build a summary of changes
      const changesArray = [];
      if (newName !== undefined && newName !== workflow.name) changesArray.push(`name: "${workflow.name}" → "${newName}"`);
      if (active !== undefined && active !== workflow.active) changesArray.push(`active: ${workflow.active} → ${active}`);
      if (nodes !== undefined) changesArray.push('nodes updated');
      if (connections !== undefined) changesArray.push('connections updated');
      if (tags !== undefined) changesArray.push('tags updated');
      
      const changesSummary = changesArray.length > 0
        ? `Changes: ${changesArray.join(', ')}`
        : 'No changes were made';
      
      return this.formatSuccess(
        {
          id: updatedWorkflow.id,
          name: updatedWorkflow.name,
          active: updatedWorkflow.active
        },
        `Workflow updated successfully. ${changesSummary}`
      );
    }, args);
  }
}

/**
 * Get tool definition for the update_workflow tool
 * 
 * @returns Tool definition
 */
export function getUpdateWorkflowToolDefinition(): ToolDefinition {
  return {
    name: 'update_workflow',
    description: 'Update an existing workflow in n8n',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Current name of the workflow to update',
        },
        newName: {
          type: 'string',
          description: 'New name for the workflow',
        },
        nodes: {
          type: 'array',
          description: 'Updated array of node objects that define the workflow',
          items: {
            type: 'object',
          },
        },
        connections: {
          type: 'object',
          description: 'Updated connection mappings between nodes',
        },
        active: {
          type: 'boolean',
          description: 'Whether the workflow should be active',
        },
        tags: {
          type: 'array',
          description: 'Updated tags to associate with the workflow',
          items: {
            type: 'string',
          },
        },
      },
      required: ['name'],
    },
  };
}
