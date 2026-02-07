/**
 * Convex client utilities for cairn CLI
 * Handles authentication and API calls to Convex backend
 */

import { ConvexHttpClient } from 'convex/browser';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CREDENTIALS_PATH = join(homedir(), '.cairn', 'credentials.json');
const CONFIG_PATH = join(homedir(), '.cairn', 'cairnsync.json');

/**
 * Load credentials from ~/.cairn/credentials.json
 */
export function loadCredentials() {
  if (!existsSync(CREDENTIALS_PATH)) {
    return null;
  }
  
  try {
    const content = readFileSync(CREDENTIALS_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load credentials:', error.message);
    return null;
  }
}

/**
 * Load Convex config from ~/.cairn/cairnsync.json
 */
export function loadConvexConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return null;
  }
  
  try {
    const content = readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load config:', error.message);
    return null;
  }
}

/**
 * Check if token is expired (with 5 minute buffer)
 */
export function isTokenExpired(credentials) {
  if (!credentials?.expiresAt) return true;
  return Date.now() >= credentials.expiresAt - 5 * 60 * 1000;
}

/**
 * Refresh the Clerk token if expired
 */
export async function refreshTokenIfNeeded(credentials, config) {
  if (!isTokenExpired(credentials)) {
    return credentials.clerkToken;
  }
  
  if (!config?.refreshEndpoint || !credentials?.sessionId || !credentials?.clerkToken) {
    throw new Error('Token expired and cannot refresh. Please re-authenticate with: cairnsync auth login');
  }
  
  try {
    const response = await fetch(config.refreshEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.clerkToken}`,
      },
      body: JSON.stringify({
        session_id: credentials.sessionId,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Refresh failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Update credentials file with new token
    if (data.token && data.expires_at) {
      const updatedCredentials = {
        ...credentials,
        clerkToken: data.token,
        expiresAt: data.expires_at,
      };
      
      writeFileSync(CREDENTIALS_PATH, JSON.stringify(updatedCredentials, null, 2));
      return data.token;
    }
    
    return credentials.clerkToken;
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}. Please re-authenticate.`);
  }
}

/**
 * Get user ID from JWT token
 */
export function getUserIdFromToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  return payload.sub;
}

/**
 * Get an authenticated Convex client
 */
export async function getConvexClient() {
  const credentials = loadCredentials();
  const config = loadConvexConfig();
  
  if (!credentials) {
    throw new Error('Not authenticated. Please run: cairnsync auth login');
  }
  
  if (!config?.convexUrl) {
    throw new Error('Convex not configured. Please ensure cairnsync is set up.');
  }
  
  const token = await refreshTokenIfNeeded(credentials, config);
  
  const client = new ConvexHttpClient(config.convexUrl);
  client.setAuth(token);
  
  return { client, userId: credentials.userId, token };
}

/**
 * Add a comment to a task via Convex
 */
export async function addTaskComment({
  taskPath,
  authorId,
  authorType,
  authorName,
  content,
  commentType,
}) {
  const { client, userId } = await getConvexClient();
  
  const result = await client.mutation('taskComments:add', {
    taskPath,
    userId,
    authorId,
    authorType,
    authorName,
    content,
    commentType: commentType || 'comment',
  });
  
  return result;
}
