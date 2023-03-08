#!/usr/bin/env node

const CLI = require('../src/cli');
const Handler = require('../src/handler');
const Utils = require('../src/utils');
const { hideBin } = require('yargs/helpers');
const { platform } = require('os');

const utils = Utils(platform(), process.cwd());
const handler = Handler(process.stdin, utils);

CLI(hideBin(process.argv), handler).run();
