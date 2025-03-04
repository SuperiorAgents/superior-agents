#!/bin/bash

# Set default port or use PORT environment variable if provided
PORT=${PORT:-4999}

# Create a new session and store the response
echo "Creating new session..."
RESPONSE=$(curl -s -X POST http://localhost:$PORT/sessions \
  -H "Content-Type: application/json" \
  --data @test_payload.json)

# Check if curl command was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to create session"
    echo "Response: $RESPONSE"
    exit 1
fi

# Check if response is empty
if [ -z "$RESPONSE" ]; then
    echo "Error: Received empty response from server"
    exit 1
fi

echo "Response: $RESPONSE"

# Extract the sessionId from the response using grep and cut
SESSION_ID=$(echo $RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

# Check if sessionId was found
if [ -z "$SESSION_ID" ]; then
    echo "Error: Could not extract session ID from response"
    exit 1
fi

echo "Session ID: $SESSION_ID"

# Wait for 1 second
sleep 1

# Check the session status
echo "Checking session status..."
STATUS=$(curl -s "http://localhost:$PORT/sessions/$SESSION_ID")
echo "$STATUS" | json_pp || echo "Failed to parse status response"

# Wait for 5 seconds
sleep 5

# Start monitoring session events
echo -e "\nMonitoring logs ..."
curl -N "http://localhost:$PORT/sessions/$SESSION_ID/logs"

# Start monitoring session events
echo -e "\nMonitoring session events..."
curl -N "http://localhost:$PORT/sessions/$SESSION_ID/events"