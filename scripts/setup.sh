#!/bin/bash
# D1A Motion Editor — Mac/Linux setup script
# Usage: curl -fsSL https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.sh | bash
# Or run locally: bash scripts/setup.sh [project-name]

PROJECT_NAME="${1:-d1a-motion-editor}"
DOWNLOADS_DIR="$HOME/Downloads"
TARGET_DIR="$DOWNLOADS_DIR/$PROJECT_NAME"

echo "D1A Motion Editor Setup"
echo "Cloning into: $TARGET_DIR"

if [ -d "$TARGET_DIR" ]; then
  echo "Folder already exists: $TARGET_DIR"
  echo "Delete it first or pass a different name: bash setup.sh my-project"
  exit 1
fi

cd "$DOWNLOADS_DIR" || exit 1
git clone https://github.com/vuthetruhub-star/remotion-editer.git "$PROJECT_NAME"

cd "$TARGET_DIR" || exit 1
pnpm install

echo ""
echo "Setup complete!"
echo "Run: pnpm dev"
echo "Then open: http://localhost:3000/edit"
