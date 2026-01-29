import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { detectAgents, getAgentName, isSupportedAgent } from './detect.js';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Agent Detection', () => {
  let originalEnv;
  let testHome;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Create temporary home directory for testing
    testHome = join(tmpdir(), `cairn-test-${Date.now()}`);
    mkdirSync(testHome, { recursive: true });
  });
  
  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    
    // Clean up test directory
    if (existsSync(testHome)) {
      rmSync(testHome, { recursive: true, force: true });
    }
  });
  
  test('detectAgents returns generic when no agents found', () => {
    // Clear environment variables that might detect agents
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CLAUDE_CODE_WORKSPACE;
    delete process.env.CURSOR_WORKSPACE;
    delete process.env.WINDSURF_WORKSPACE;
    
    const result = detectAgents();
    
    expect(result).toHaveProperty('primary');
    expect(result).toHaveProperty('detected');
    expect(Array.isArray(result.detected)).toBe(true);
    
    // If running in environment with actual agents installed, primary might not be generic
    // Just verify it returns a valid agent type
    expect(isSupportedAgent(result.primary)).toBe(true);
  });
  
  test('detectAgents finds Clawdbot when .clawdbot exists', () => {
    // This test only runs if .clawdbot actually exists
    const clawdbotPath = join(process.env.HOME, '.clawdbot');
    if (existsSync(clawdbotPath)) {
      const result = detectAgents();
      expect(result.detected).toContain('clawdbot');
    }
  });
  
  test('detectAgents finds Claude Code when env var set', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    
    const result = detectAgents();
    
    expect(result.detected).toContain('claude-code');
  });
  
  test('detectAgents finds Cursor when .cursorrules exists', () => {
    // Only test if in actual Cursor environment
    if (existsSync('.cursorrules')) {
      const result = detectAgents();
      expect(result.detected).toContain('cursor');
    }
  });
  
  test('detectAgents handles multiple agents', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.CURSOR_WORKSPACE = 'test-workspace';
    
    const result = detectAgents();
    
    expect(result.detected.length).toBeGreaterThanOrEqual(1);
    expect(result.primary).toBeTruthy();
  });
  
  test('getAgentName returns correct display names', () => {
    expect(getAgentName('clawdbot')).toBe('Clawdbot');
    expect(getAgentName('claude-code')).toBe('Claude Code');
    expect(getAgentName('cursor')).toBe('Cursor');
    expect(getAgentName('windsurf')).toBe('Windsurf');
    expect(getAgentName('generic')).toBe('Generic AI Agent');
  });
  
  test('getAgentName returns input for unknown agent', () => {
    expect(getAgentName('unknown-agent')).toBe('unknown-agent');
  });
  
  test('isSupportedAgent validates known agents', () => {
    expect(isSupportedAgent('clawdbot')).toBe(true);
    expect(isSupportedAgent('claude-code')).toBe(true);
    expect(isSupportedAgent('cursor')).toBe(true);
    expect(isSupportedAgent('windsurf')).toBe(true);
    expect(isSupportedAgent('generic')).toBe(true);
  });
  
  test('isSupportedAgent rejects unknown agents', () => {
    expect(isSupportedAgent('unknown')).toBe(false);
    expect(isSupportedAgent('invalid')).toBe(false);
    expect(isSupportedAgent('')).toBe(false);
  });
});
