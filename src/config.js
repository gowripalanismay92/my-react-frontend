// Centralized configuration management for frontend environment variables
export const config = {
  // Automatically switches between local proxy/FastAPI and production URLs
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  databricksClientId: import.meta.env.VITE_DATABRICKS_CLIENT_ID || 'YOUR_DATABRICKS_OAUTH_CLIENT_ID',
  databricksHost: import.meta.env.VITE_DATABRICKS_HOST || 'https://dbc-37fd6a7c-5204.cloud.databricks.com',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
};