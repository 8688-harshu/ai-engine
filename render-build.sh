#!/usr/bin/env bash
# Exit on error
set -o errexit

# FORCE the browser path to be in the project directory
export PLAYWRIGHT_BROWSERS_PATH=0

npm install
npm run build:prod

# Install Playwright Browsers to ./node_modules/
npx playwright install chromium
