import spawnAsync from '@expo/spawn-async';
import chalk from 'chalk';

const debug = require('debug')('expo:init:git') as typeof console.log;

export async function initGitRepoAsync(root: string) {
  // let's see if we're in a git tree
  try {
    await spawnAsync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore', cwd: root });
    debug(chalk.dim('New project is already inside of a Git repo, skipping git init.'));
  } catch (e: any) {
    if (e.errno === 'ENOENT') {
      debug(chalk.dim('Unable to initialize Git repo. `git` not in $PATH.'));
      return false;
    }
  }

  const packageJSON = require('../package.json');

  // not in git tree, so let's init
  try {
    await spawnAsync('git', ['init'], { stdio: 'ignore', cwd: root });
    await spawnAsync('git', ['add', '-A'], { stdio: 'ignore', cwd: root });

    const commitMsg = `Initial commit\n\nGenerated by ${packageJSON.name} ${packageJSON.version}.`;
    await spawnAsync('git', ['commit', '-m', commitMsg], {
      stdio: 'ignore',
      cwd: root,
    });

    debug(chalk.dim('Initialized a Git repository.'));
    return true;
  } catch (error: any) {
    debug('Error initializing Git repo:', error);
    // no-op -- this is just a convenience and we don't care if it fails
    return false;
  }
}
