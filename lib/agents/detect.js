import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Detect which AI agent(s) are available in the environment
 * @returns {Object} { primary: string, detected: string[] }
 */
export function detectAgents() {
  const detected = [];
  
  // Check for Clawdbot
  const clawdbotPath = join(homedir(), '.clawdbot');
  if (existsSync(clawdbotPath)) {
    detected.push('clawdbot');
  }
  
  // Check for Claude Code
  // Claude Code typically sets environment variables or has workspace indicators
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CODE_WORKSPACE) {
    detected.push('claude-code');
  }
  
  // Check for Cursor
  // Cursor uses .cursorrules file or sets env variables
  if (existsSync('.cursorrules') || process.env.CURSOR_WORKSPACE) {
    detected.push('cursor');
  }
  
  // Check for Windsurf
  if (process.env.WINDSURF_WORKSPACE) {
    detected.push('windsurf');
  }
  
  // Determine primary agent (first detected, or generic)
  const primary = detected[0] || 'generic';
  
  return { primary, detected };
}

/**
 * Get agent display name
 */
export function getAgentName(type) {
  const names = {
    'clawdbot': 'Clawdbot',
    'claude-code': 'Claude Code',
    'cursor': 'Cursor',
    'windsurf': 'Windsurf',
    'generic': 'Generic AI Agent'
  };
  return names[type] || type;
}

/**
 * Check if an agent type is supported
 */
export function isSupportedAgent(type) {
  return ['clawdbot', 'claude-code', 'cursor', 'windsurf', 'generic'].includes(type);
}
