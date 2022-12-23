#!/usr/bin/env node

import program from 'commander'

import { processFile } from './index'

program
  .version('0.1.0')
  .parse(process.argv)

processFile(program.args[0], program.args[1])