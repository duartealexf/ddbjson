#!/usr/bin/env node

const CLI = require("../src/cli");
const Handler = require('../src/handler');
const { hideBin } = require('yargs/helpers')

CLI(hideBin(process.argv), Handler(process.stdin)).run();
