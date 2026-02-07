import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Load Convex URL from cairnsync config
 */
export function getConvexUrl() {
  const configPath = join(homedir(), '.cairn', 'cairnsync.json');
  
  if (!existsSync(configPath)) {
    throw new Error('Cairn config not found. Run cairnsync to set up.');
  }
  
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    if (!config.convexUrl) {
      throw new Error('convexUrl not found in cairn config');
    }
    return config.convexUrl;
  } catch (err) {
    throw new Error(`Failed to read cairn config: ${err.message}`);
  }
}
