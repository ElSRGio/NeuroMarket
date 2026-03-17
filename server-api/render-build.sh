#!/usr/bin/env bash
set -e
npm install
# Descarga Chromium bundled de Puppeteer
node node_modules/puppeteer/install.mjs 2>/dev/null || node -e "require('puppeteer')" 2>/dev/null || true
echo "[build] Done"
