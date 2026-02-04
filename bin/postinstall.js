#!/usr/bin/env node

import { execSync } from 'child_process';
import { join } from 'path';

// Use stderr so npm doesn't suppress the output
const log = (msg = '') => process.stderr.write(msg + '\n');

try {
  const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const npmBin = join(npmPrefix, 'bin');

  // Check the user's login shell PATH, not the current process PATH.
  // npm temporarily adds its bin dir to PATH during install, so checking
  // process.env.PATH would give a false positive.
  const shell = process.env.SHELL || '';
  let loginPath = '';
  try {
    if (shell.includes('fish')) {
      loginPath = execSync('fish -l -c "echo $PATH"', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } else {
      loginPath = execSync(`${shell} -l -c "echo \\$PATH"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    }
  } catch {
    loginPath = process.env.PATH || '';
  }

  const pathDirs = loginPath.split(':');
  const inPath = pathDirs.some(dir => dir === npmBin);

  if (!inPath) {
    let rcFile = '~/.bashrc';
    if (shell.includes('zsh')) rcFile = '~/.zshrc';
    else if (shell.includes('fish')) rcFile = '~/.config/fish/config.fish';

    log();
    log('\x1b[33m⚠  Almost there!\x1b[0m The \x1b[1mcairn\x1b[0m command was installed, but your shell can\'t find it yet.');
    log();
    log('  Add the npm global bin directory to your PATH:');
    log();
    if (shell.includes('fish')) {
      log(`    \x1b[36mset -U fish_user_paths ${npmBin} $fish_user_paths\x1b[0m`);
    } else {
      log(`    \x1b[36mecho 'export PATH="${npmBin}:$PATH"' >> ${rcFile}\x1b[0m`);
      log(`    \x1b[36msource ${rcFile}\x1b[0m`);
    }
    log();
    log('  Or run directly with:');
    log();
    log('    \x1b[36mnpx cairn-work\x1b[0m');
    log();
  }
} catch {
  // fall through
}

log();
log('  \x1b[36mThanks for installing Cairn!\x1b[0m');
log('  Join the community: \x1b[4mhttps://github.com/letcairnwork/cairn-cli/discussions\x1b[0m');
log('  Follow for updates: \x1b[4mhttps://x.com/letcairnwork\x1b[0m');
log();
