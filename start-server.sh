#!/bin/bash

# Kill any existing process on port 8001
lsof -i :8001 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null

# Build and start the server
cd "$(dirname "$0")" && \
npm run build && \
N8N_API_URL=http://localhost:5678/api/v1 \
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MjIxZDU4NC0xNTQ5LTQyZWEtYmFlOC1kOTU5YTE2NTFmMDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ1MDk3NTIyLCJleHAiOjE3NDc2MjcyMDB9.xQixwbb6D-mcflY3p6NOIMFHpzUitQZJ78Y_CiymJwU" \
N8N_WEBHOOK_USER=test-webhook-user-123 \
N8N_WEBHOOK_PASSWORD=test-webhook-password-123 \
DEBUG=true \
npx -y supergateway --stdio "n8n-mcp-server" --port 8001 --baseUrl http://localhost:8001 --ssePath /sse --messagePath /message --cors 