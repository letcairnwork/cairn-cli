import onboard from './onboard.js';

export default async function init(options) {
  await onboard({ path: options.path || process.cwd() });
}
