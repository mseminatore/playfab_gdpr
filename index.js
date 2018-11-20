"use strict";

var gdpr = require("./gdpr");

require('colors');
var program = require('commander');

program
  .usage('[options] zipfile')
//  .option('-U, --uri [string]', 'URI of test server (e.g. http://127.0.0.1:3000)')
  .parse(process.argv);

if (program.args.length < 1) {
    program.help();
}

var filename = program.args[0];

gdpr.process(filename);

