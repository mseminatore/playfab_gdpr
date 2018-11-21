/**
 * @file gdpr.js PlayFab GDPR file processor
 *
 * @copyright Copyright (c) 2018 Mark Seminatore
 * 
 * @license MIT
 * 
 * Refer to included LICENSE file for usage rights and restrictions
 */
"use strict";

const decompress = require("decompress");
const fs = require('fs');
const path = require('path');
const jsonlines = require('jsonlines');
const parser = jsonlines.parse();

/**
 *
 */
function prolog() {
    output("<html>");
    output("<head>");
    output("<link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'>");
    output("<link rel='stylesheet' href='style.css'>");
    output("<script src='util.js'></script>");
    output("</head>");
    output("<body class='background'>");
}

/**
 * 
 */
function epilog() {
    output("</body></html>");
}

/**
 * 
 * @param {string} str 
 */
function output(str) {
    // TODO - also allow outputting to a file if given on command-line
    console.log(str);
}

// handlers for special files
var specialFiles = {
    "master_player_export.json": masterPlayerData,
    // "event-history.jsonl": eventHistory
};

// handlers for special properties
var specialProps = {
    "TitleId": skip //redact
};

// skip over a property
function skip(property, obj) {
    /* do nothing! */
}

// redact a property
function redact(property, obj) {
    output("<tr><td>" + property + "</td><td>{redacted}</td></tr>");
}

// print a proprty
function print(property, obj) {
    output("<tr><td>" + property + "</td><td>" + obj[property] + "</td></tr>");
}

//
// Recursively process all the object properties
//
function dumpObject(obj) {
    for (var property in obj) {
        if (specialProps[property]) {
            specialProps[property](property, obj[property]);
        } else if (typeof obj[property] === 'object' && obj[property] !== null) {
            // console.error(property);
            // console.error(typeof obj[property]);
            
            if (Array.isArray(obj[property])) {
                output("<tr><td colspan='2' class='array'>" + property + " [array]</td></tr>");
            }

            // console.error("Dumping object " + property);

            dumpObject(obj[property]);

            // end of array
            if (Array.isArray(obj[property])) {
            }

        } else {
            // write out the property
            print(property, obj);
        }
    }
}

/**
 * 
 * @param {object} file 
 */
 function masterPlayerData(file) {
    console.error("Found master player file!");
    var mp = JSON.parse(file.data.toString());

    output("<table>");
    output("<caption>" + path.basename(file.path) + "</caption>");
    output("<tr><th>Property</th><th>Value</th></tr>");

    // recursively process all the properties in the file
    dumpObject(mp);

    output("</table>"); 
 }

/**
 * 
 * @param {object} file 
 */
 function eventHistory(file) {
    console.error("Found event history file!");

    output("<table>");
    output("<caption>" + path.basename(file.path) + "</caption>");
    output("<tr><th>Property</th><th>Value</th></tr>");

    parser.on('data', function(data) {
        dumpObject(data);
    });

    parser.write(file.data.toString());
    parser.end();

    output("</table>");
 }

/**
 * @function process a PlayFab GDPR ZIP file
 */
exports.process = function process(filename) {
    // output the html prolog
    prolog();

    decompress(filename).then(files => {
        console.error("The archive contains " + files.length + " files\n");

        // process all the files in the archive
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // process the file if there is a handler for it
            var fileHandler = specialFiles[path.basename(file.path)];
            if (fileHandler) {
                fileHandler(file);
            }
        }

        // output the html epilog
        epilog();

        console.error('All done!');
    });
}