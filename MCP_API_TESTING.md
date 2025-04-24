# MCP (n8n) API Testing Documentation

## Prerequisites
- n8n instance running on `http://localhost:5678`
- API Key set in environment variable:
```bash
export N8N_API_KEY="your-api-key-here"
```

## Workflow Operations

### 1. Create a Workflow
```bash
curl -X POST "http://localhost:5678/api/v1/workflows" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d '{
    "name": "Test Workflow",
    "nodes": [
      {
        "id": "1",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "parameters": {
          "interval": [{"field": "minutes", "value": 5}]
        },
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "id": "2",
        "name": "HTTP Request",
        "type": "n8n-nodes-base.httpRequest",
        "parameters": {
          "url": "https://jsonplaceholder.typicode.com/posts/1",
          "method": "GET"
        },
        "typeVersion": 1,
        "position": [450, 300]
      }
    ],
    "connections": {
      "Schedule Trigger": {
        "main": [[{"node": "HTTP Request", "type": "main", "index": 0}]]
      }
    },
    "settings": {
      "saveExecutionProgress": true,
      "saveManualExecutions": true
    }
  }'
```

### 2. List All Workflows
```bash
curl -X GET "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 3. Get a Specific Workflow
```bash
curl -X GET "http://localhost:5678/api/v1/workflows/{workflowId}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 4. Update a Workflow
```bash
curl -X PUT "http://localhost:5678/api/v1/workflows/{workflowId}" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d '{
    "name": "Updated Workflow Name",
    "nodes": [...],
    "connections": {...},
    "settings": {...}
  }'
```

### 5. Delete a Workflow
```bash
curl -X DELETE "http://localhost:5678/api/v1/workflows/{workflowId}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## Tag Operations

### 1. Create a Tag
```bash
curl -X POST "http://localhost:5678/api/v1/tags" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d '{"name": "test-tag"}'
```

### 2. List All Tags
```bash
curl -X GET "http://localhost:5678/api/v1/tags" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 3. Update a Tag
```bash
curl -X PUT "http://localhost:5678/api/v1/tags/{tagId}" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d '{"name": "updated-tag-name"}'
```

### 4. Delete a Tag
```bash
curl -X DELETE "http://localhost:5678/api/v1/tags/{tagId}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## Execution Operations

### 1. Execute a Workflow
```bash
curl -X POST "http://localhost:5678/api/v1/workflows/{workflowId}/run" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 2. Get Workflow Executions
```bash
curl -X GET "http://localhost:5678/api/v1/executions" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 3. Get a Specific Execution
```bash
curl -X GET "http://localhost:5678/api/v1/executions/{executionId}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## Credential Operations

### 1. List All Credentials
```bash
curl -X GET "http://localhost:5678/api/v1/credentials" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 2. Get a Specific Credential
```bash
curl -X GET "http://localhost:5678/api/v1/credentials/{credentialId}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## User Operations

### 1. List All Users
```bash
curl -X GET "http://localhost:5678/api/v1/users" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 2. Get Current User
```bash
curl -X GET "http://localhost:5678/api/v1/users/me" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 405: Method Not Allowed

## Notes
- Replace `{workflowId}`, `{tagId}`, `{executionId}`, and `{credentialId}` with actual IDs from your n8n instance
- All requests require the `X-N8N-API-KEY` header
- For POST and PUT requests, ensure the Content-Type header is set to "application/json"
- The API key should be kept secure and not shared 