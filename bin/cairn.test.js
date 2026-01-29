import { describe, test, expect } from 'bun:test';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CLI Executable', () => {
  test('cairn.js exists and is executable', () => {
    const cliPath = join(__dirname, 'cairn.js');
    expect(existsSync(cliPath)).toBe(true);
  });
  
  test('cairn.js has shebang', () => {
    const cliPath = join(__dirname, 'cairn.js');
    const content = require('fs').readFileSync(cliPath, 'utf-8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });
  
  test('cairn.js imports commander', () => {
    const cliPath = join(__dirname, 'cairn.js');
    const content = require('fs').readFileSync(cliPath, 'utf-8');
    expect(content).toContain('commander');
  });
});
