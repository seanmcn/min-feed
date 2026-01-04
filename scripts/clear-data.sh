#!/bin/bash
# Clear all data from NoiseGate DynamoDB tables (sandbox)
# This deletes FeedItem, StoryGroup, Feed, and UserPreferences data

set -e

echo "Finding NoiseGate tables..."

# Find tables dynamically - they have unique sandbox suffixes
# Use awk to get just the first table name (AWS returns tab-separated)
FEED_TABLE=$(aws dynamodb list-tables --query "TableNames[?starts_with(@, 'Feed-')]" --output text | awk '{print $1}')
FEED_ITEM_TABLE=$(aws dynamodb list-tables --query "TableNames[?starts_with(@, 'FeedItem-')]" --output text | awk '{print $1}')
STORY_GROUP_TABLE=$(aws dynamodb list-tables --query "TableNames[?starts_with(@, 'StoryGroup-')]" --output text | awk '{print $1}')
USER_PREFS_TABLE=$(aws dynamodb list-tables --query "TableNames[?starts_with(@, 'UserPreferences-')]" --output text | awk '{print $1}')

# Function to clear a table
clear_table() {
  local TABLE_NAME=$1

  if [ -z "$TABLE_NAME" ]; then
    echo "  Table not found, skipping..."
    return
  fi

  echo "  Clearing $TABLE_NAME..."

  # Get all item keys
  local ITEMS=$(aws dynamodb scan --table-name "$TABLE_NAME" --projection-expression "id" --output json 2>/dev/null)
  local COUNT=$(echo "$ITEMS" | jq '.Count')

  if [ "$COUNT" == "0" ] || [ "$COUNT" == "null" ]; then
    echo "    No items to delete"
    return
  fi

  echo "    Deleting $COUNT items..."

  # Delete each item
  echo "$ITEMS" | jq -r '.Items[].id.S' | while read -r ID; do
    if [ -n "$ID" ]; then
      aws dynamodb delete-item --table-name "$TABLE_NAME" --key "{\"id\": {\"S\": \"$ID\"}}" 2>/dev/null
    fi
  done

  echo "    Done"
}

echo ""
echo "=== Clearing FeedItem table ==="
clear_table "$FEED_ITEM_TABLE"

echo ""
echo "=== Clearing StoryGroup table ==="
clear_table "$STORY_GROUP_TABLE"

echo ""
echo "=== Clearing Feed table ==="
clear_table "$FEED_TABLE"

echo ""
echo "=== Clearing UserPreferences table ==="
clear_table "$USER_PREFS_TABLE"

echo ""
echo "All data cleared! Default feeds will be seeded on next app load."
