/**
 * Puppeteer config — Chromium download cache path
 * Necesario para que Render encuentre el ejecutable en builds
 */
const { join } = require("path");

module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
