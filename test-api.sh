#!/bin/bash

# Base URL - change if your server runs on a different port
BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Todo API Endpoints..."
echo "=============================="

# 1. Register a new user
echo -e "\n${GREEN}1. Testing User Registration:${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "password": "password123"
}')
echo "Response: $REGISTER_RESPONSE"

# 2. Login
echo -e "\n${GREEN}2. Testing User Login:${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "password": "password123"
}')
echo "Response: $LOGIN_RESPONSE"

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "Token: $TOKEN"

# 3. Create a new task
echo -e "\n${GREEN}3. Testing Create Task:${NC}"
CREATE_TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "title": "Test Task",
  "description": "This is a test task"
}')
echo "Response: $CREATE_TASK_RESPONSE"

# Extract task ID from create response
TASK_ID=$(echo $CREATE_TASK_RESPONSE | grep -o '"id":[^,}]*' | grep -o '[0-9]*')
echo "Created Task ID: $TASK_ID"

# 4. Get all tasks
echo -e "\n${GREEN}4. Testing Get All Tasks:${NC}"
curl -s -X GET "$BASE_URL/tasks" \
-H "Authorization: Bearer $TOKEN"

# 5. Get task by ID
echo -e "\n${GREEN}5. Testing Get Task by ID:${NC}"
curl -s -X GET "$BASE_URL/tasks/$TASK_ID" \
-H "Authorization: Bearer $TOKEN"

# 6. Update task status
echo -e "\n${GREEN}6. Testing Update Task Status:${NC}"
curl -s -X PUT "$BASE_URL/tasks/$TASK_ID" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "status": "in-progress"
}'

# 7. Verify task was updated
echo -e "\n${GREEN}7. Verifying Task Update:${NC}"
curl -s -X GET "$BASE_URL/tasks/$TASK_ID" \
-H "Authorization: Bearer $TOKEN"

# 8. Delete task
echo -e "\n${GREEN}8. Testing Delete Task:${NC}"
curl -s -X DELETE "$BASE_URL/tasks/$TASK_ID" \
-H "Authorization: Bearer $TOKEN"

# 9. Verify task was deleted
echo -e "\n${GREEN}9. Verifying Task Deletion:${NC}"
curl -s -X GET "$BASE_URL/tasks/$TASK_ID" \
-H "Authorization: Bearer $TOKEN"

echo -e "\n${GREEN}Testing Complete!${NC}"