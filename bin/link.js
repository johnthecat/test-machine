#!/usr/bin/env node

const { ensureSymlinkSync } = require('fs-extra');
const { resolve, join } = require('path');

const PROJECT_FOLDER = resolve(__dirname, '..');
const cwd = process.cwd();

ensureSymlinkSync(join(PROJECT_FOLDER, 'tsconfig.json'), join(cwd, 'tsconfig.json'));
ensureSymlinkSync(join(PROJECT_FOLDER, '.npmignore'), join(cwd, '.npmignore'));
ensureSymlinkSync(join(PROJECT_FOLDER, '.npmrc'), join(cwd, '.npmrc'));
