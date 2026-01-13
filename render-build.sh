#!/usr/bin/env bash
# Exit on error
set -o errexit

npm install
npm run build:prod

# Install Playwright Browsers
npx playwright install chromium
