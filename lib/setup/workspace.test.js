import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { 
  createWorkspace, 
  workspaceExists, 
  validateWorkspace,
  createWelcomeFile 
} from './workspace.js';
import { existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Workspace Management', () => {
  let testPath;
  
  beforeEach(() => {
    // Create unique test directory
    testPath = join(tmpdir(), `cairn-test-workspace-${Date.now()}`);
  });
  
  afterEach(() => {
    // Clean up test directory
    if (existsSync(testPath)) {
      rmSync(testPath, { recursive: true, force: true });
    }
  });
  
  test('createWorkspace creates all required folders', () => {
    createWorkspace(testPath);
    
    const expectedFolders = [
      '',
      'quests',
      'inbox',
      'inbox/processed',
      'inbox/proposed-paths',
      '_drafts',
      '_conflicts',
      '_abandoned',
    ];
    
    for (const folder of expectedFolders) {
      const fullPath = join(testPath, folder);
      expect(existsSync(fullPath)).toBe(true);
    }
  });
  
  test('createWorkspace returns workspace path', () => {
    const result = createWorkspace(testPath);
    expect(result).toBe(testPath);
  });
  
  test('createWorkspace is idempotent', () => {
    // Create workspace twice
    createWorkspace(testPath);
    createWorkspace(testPath);
    
    // Should still exist and be valid
    expect(existsSync(join(testPath, 'quests'))).toBe(true);
  });
  
  test('workspaceExists returns false for non-existent workspace', () => {
    expect(workspaceExists(testPath)).toBe(false);
  });
  
  test('workspaceExists returns true after creation', () => {
    createWorkspace(testPath);
    expect(workspaceExists(testPath)).toBe(true);
  });
  
  test('validateWorkspace detects valid workspace', () => {
    createWorkspace(testPath);
    
    const result = validateWorkspace(testPath);
    
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });
  
  test('validateWorkspace detects missing folders', () => {
    // Create workspace but remove a required folder
    createWorkspace(testPath);
    rmSync(join(testPath, 'inbox'), { recursive: true, force: true });
    
    const result = validateWorkspace(testPath);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('inbox');
  });
  
  test('validateWorkspace detects completely invalid workspace', () => {
    const result = validateWorkspace(testPath);
    
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });
  
  test('createWelcomeFile creates README', () => {
    createWorkspace(testPath);
    createWelcomeFile(testPath);
    
    const readmePath = join(testPath, 'README.md');
    expect(existsSync(readmePath)).toBe(true);
    
    const content = readFileSync(readmePath, 'utf-8');
    expect(content).toContain('Welcome to Cairn');
    expect(content).toContain('quests/');
  });
  
  test('createWelcomeFile does not overwrite existing README', () => {
    createWorkspace(testPath);
    
    const readmePath = join(testPath, 'README.md');
    const originalContent = '# My Custom README';
    
    // Create custom README first
    require('fs').writeFileSync(readmePath, originalContent);
    
    // Try to create welcome file
    createWelcomeFile(testPath);
    
    // Should still have original content
    const content = readFileSync(readmePath, 'utf-8');
    expect(content).toBe(originalContent);
  });
});
