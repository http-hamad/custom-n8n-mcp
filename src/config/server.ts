/**
 * Server Configuration
 * 
 * This module configures the MCP server with tools and resources
 * for n8n workflow management.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getEnvConfig } from './environment.js';
import { setupWorkflowTools } from '../tools/workflow/index.js';
import { setupExecutionTools } from '../tools/execution/index.js';
import { setupResourceHandlers } from '../resources/index.js';
import { createApiService } from '../api/n8n-client.js';

// Import types
import { ToolCallResult, ToolDefinition } from '../types/index.js';

// Import handlers
import { 
  ListWorkflowsHandler, 
  GetWorkflowHandler,
  CreateWorkflowHandler,
  UpdateWorkflowHandler,
  DeleteWorkflowHandler,
  ActivateWorkflowHandler,
  DeactivateWorkflowHandler
} from '../tools/workflow/index.js';
import {
  ListExecutionsHandler,
  GetExecutionHandler,
  DeleteExecutionHandler,
  RunWebhookHandler
} from '../tools/execution/index.js';

// Store loaded tools and handlers
let loadedTools: ToolDefinition[] = [];
const toolHandlers = new Map<string, any>();

/**
 * Configure and return an MCP server instance with all tools and resources
 * 
 * @returns Configured MCP server instance
 */
export async function configureServer(): Promise<Server> {
  // Get validated environment configuration
  const envConfig = getEnvConfig();
  
  // Create n8n API service
  const apiService = createApiService(envConfig);
  
  // Verify n8n API connectivity
  try {
    console.error('Verifying n8n API connectivity...');
    await apiService.checkConnectivity();
    console.error(`Successfully connected to n8n API at ${envConfig.n8nApiUrl}`);
  } catch (error) {
    console.error('ERROR: Failed to connect to n8n API:', error instanceof Error ? error.message : error);
    throw error;
  }

  // Load tools and resources
  const workflowTools = await setupWorkflowTools();
  const executionTools = await setupExecutionTools();
  
  // Store loaded tools
  loadedTools = [...workflowTools, ...executionTools];
  
  // Initialize tool handlers
  toolHandlers.set('list_workflows', new ListWorkflowsHandler());
  toolHandlers.set('get_workflow', new GetWorkflowHandler());
  toolHandlers.set('create_workflow', new CreateWorkflowHandler());
  toolHandlers.set('update_workflow', new UpdateWorkflowHandler());
  toolHandlers.set('delete_workflow', new DeleteWorkflowHandler());
  toolHandlers.set('activate_workflow', new ActivateWorkflowHandler());
  toolHandlers.set('deactivate_workflow', new DeactivateWorkflowHandler());
  toolHandlers.set('list_executions', new ListExecutionsHandler());
  toolHandlers.set('get_execution', new GetExecutionHandler());
  toolHandlers.set('delete_execution', new DeleteExecutionHandler());
  toolHandlers.set('run_webhook', new RunWebhookHandler());
  
  // Convert tools array to object with string keys
  const toolsObject = loadedTools.reduce((acc, tool) => {
    acc[tool.name] = tool;
    return acc;
  }, {} as Record<string, ToolDefinition>);

  // Create server instance with loaded capabilities
  const server = new Server(
    {
      name: 'n8n-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        resources: {
          // Add static resources
          workflows: {
            uri: 'n8n://workflows',
            metadata: {
              name: 'Workflows',
              description: 'List of all workflows',
            },
          },
          'execution-stats': {
            uri: 'n8n://execution-stats',
            metadata: {
              name: 'Execution Statistics',
              description: 'Statistics about workflow executions',
            },
          },
        },
        tools: toolsObject,
      },
    }
  );

  // Set up all request handlers
  setupToolListRequestHandler(server);
  setupToolCallRequestHandler(server);
  setupResourceHandlers(server, envConfig);

  return server;
}

/**
 * Set up the tool list request handler for the server
 * 
 * @param server MCP server instance
 */
function setupToolListRequestHandler(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: loadedTools,
    };
  });
}

/**
 * Set up the tool call request handler for the server
 * 
 * @param server MCP server instance
 */
function setupToolCallRequestHandler(server: Server): void {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments || {};

    try {
      const handler = toolHandlers.get(toolName);
      if (!handler) {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      const result = await handler.execute(args);

      // Converting to MCP SDK expected format
      return {
        content: result.content,
        isError: result.isError,
      };
    } catch (error) {
      console.error(`Error handling tool call to ${toolName}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });
}
