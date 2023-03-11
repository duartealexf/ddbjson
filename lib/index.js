#!/usr/bin/env node

const CLI = require('../src/cli');
const Handler = require('../src/handler');
const StringHelper = require('../src/helpers/string');
const PathHelper = require('../src/helpers/path');
const { hideBin } = require('yargs/helpers');
const { platform } = require('os');

const stringHelper = StringHelper();
const pathHelper = PathHelper(platform(), process.cwd());
const handler = Handler(process.stdin, pathHelper, stringHelper);

CLI(hideBin(process.argv), handler).run();
