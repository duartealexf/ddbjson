#!/usr/bin/env node

const CLI = require("./cli");
const Handler = require('./handler');
const { hideBin } = require('yargs/helpers')

CLI(hideBin(process.argv), Handler(process.stdin)).run();
