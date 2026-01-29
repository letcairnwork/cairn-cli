import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Check npm registry for latest version and prompt to update
 */
export default async function update() {
  console.log(chalk.bold.cyan('\n🏔️  Checking for updates...\n'));
  
  // Get current version
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, '../../package.json'), 'utf8')
  );
  const currentVersion = packageJson.version;
  
  try {
    // Check npm registry for latest version
    const { stdout } = await execAsync('npm view cairnquest version');
    const latestVersion = stdout.trim();
    
    console.log(chalk.dim('Current version:'), chalk.cyan(currentVersion));
    console.log(chalk.dim('Latest version:'), chalk.cyan(latestVersion));
    console.log();
    
    if (currentVersion === latestVersion) {
      console.log(chalk.green('✓'), 'You are running the latest version!');
      console.log();
      return;
    }
    
    // Prompt to update
    const { shouldUpdate } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldUpdate',
      message: `Update to v${latestVersion}?`,
      default: true
    }]);
    
    if (!shouldUpdate) {
      console.log(chalk.yellow('\nUpdate cancelled.'));
      return;
    }
    
    // Perform update
    console.log();
    console.log(chalk.dim('Running:'), chalk.cyan('npm install -g cairnquest@latest'));
    console.log();
    
    const updateProcess = exec('npm install -g cairnquest@latest');
    updateProcess.stdout.pipe(process.stdout);
    updateProcess.stderr.pipe(process.stderr);
    
    updateProcess.on('exit', (code) => {
      if (code === 0) {
        console.log();
        console.log(chalk.green('✓'), 'Update complete!');
        console.log(chalk.dim('Run'), chalk.cyan('cairn --version'), chalk.dim('to verify.'));
        console.log();
      } else {
        console.log();
        console.error(chalk.red('✗'), 'Update failed');
        console.log(chalk.dim('Try running manually:'), chalk.cyan('npm install -g cairnquest@latest'));
        console.log();
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error(chalk.red('Error checking for updates:'), error.message);
    console.log(chalk.dim('\nYou can update manually:'));
    console.log(chalk.cyan('  npm install -g cairnquest@latest'));
    console.log();
    process.exit(1);
  }
}
