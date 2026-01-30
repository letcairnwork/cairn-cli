import { execSync } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Check npm registry for latest version and prompt to update
 */
export default async function update() {
  console.log(chalk.bold.cyan('\n🦮  Checking for updates...\n'));

  // Get current version
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, '../../package.json'), 'utf8')
  );
  const currentVersion = packageJson.version;

  try {
    // Check npm registry for latest version
    const latestVersion = execSync('npm view cairn-work version', { encoding: 'utf8' }).trim();

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

    // Perform update — use execSync so we block until npm finishes
    console.log();
    console.log(chalk.dim('Running:'), chalk.cyan(`npm install -g cairn-work@${latestVersion}`));
    console.log();

    execSync(`npm install -g cairn-work@${latestVersion}`, { stdio: 'inherit' });

    // Verify the update actually worked by checking the installed version
    const installedVersion = execSync('npm list -g cairn-work --depth=0 --json', { encoding: 'utf8' });
    const installedJson = JSON.parse(installedVersion);
    const actualVersion = installedJson.dependencies?.['cairn-work']?.version;

    console.log();
    if (actualVersion === latestVersion) {
      console.log(chalk.green('✓'), `Updated to v${latestVersion}!`);
    } else {
      console.log(chalk.yellow('⚠'), `Install ran but version is ${actualVersion || 'unknown'} (expected ${latestVersion})`);
      console.log(chalk.dim('Try running manually:'), chalk.cyan(`npm install -g cairn-work@${latestVersion}`));
    }
    console.log();

  } catch (error) {
    console.log();
    console.error(chalk.red('Error:'), error.message);
    console.log(chalk.dim('\nYou can update manually:'));
    console.log(chalk.cyan('  npm install -g cairn-work@latest'));
    console.log();
    process.exit(1);
  }
}
