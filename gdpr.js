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

var arrayIndex = 0;

/**
 *
 */
function prolog() {
    console.log("<html>");
    console.log("<head>");
    console.log("<link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'>");
    console.log("<link rel='stylesheet' href='style.css'>");
    console.log("<script src='util.js'></script>");
    console.log("</head>");
    console.log("<body class='background'>");
}

/**
 * 
 */
function epilog() {
    console.log("</body></html>");
}

/**
 * {
 *   data: Buffer,
 *   mode: Number,
 *   mtime: String,
 *   path: String,
 *   type: String
 * }
 */


// handlers for special files
var specialFiles = {
    "master_player_export.json": masterPlayerData
//    "event-history.jsonl": eventHistory
};

// handlers for special properties
var specialProps = {
    "TitleId": skip //redact
};

// skip a property
function skip(property, obj) {

}

// redact a property
function redact(property, obj) {
    console.log("<tr><td>" + property + "</td><td>{redacted}</td></tr>");
}

// print a proprty
function print(property, obj) {
    console.log("<tr><td>" + property + "</td><td>" + obj[property] + "</td></tr>");
}

//
function dumpObject(obj) {
    for (var property in obj) {
        if (specialProps[property]) {
            specialProps[property](property, obj[property]);
        } else if (typeof obj[property] === 'object' && obj[property] !== null) {
            // console.error(property);
            // console.error(typeof obj[property]);
            
            if (Array.isArray(obj[property])) {
                console.log("<tr><td colspan='2' class='array'>" + property + " [array]</td></tr>");
                // console.log("<tbody id='el" + arrayIndex + "' class='w3-hide'>");
                arrayIndex++;
            }

            // console.error("Dumping object " + property);

            dumpObject(obj[property]);

            if (Array.isArray(obj[property])) {
                // console.log("</tbody>");
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

    console.log("<table>");
    console.log("<caption>" + path.basename(file.path) + "</caption>");
    console.log("<thead><tr><th>Property</th><th>Value</th></tr></thead>");

    // recursively process all the properties in the file
    dumpObject(mp);

    // for (var x in mp) {
    //     console.log("<tr><td>" + x + "</td><td>" + mp[x] + "</td></tr>");
    //     if (specialProps[x]) {
    //         specialProps[x](mp[x]);
    //     }
    // }

    console.log("</table>"); 
 }

/**
 * 
 * @param {object} file 
 */
 function eventHistory(file) {
    console.error("Found event history file!");
    var mp = JSON.parse(file.data.toString());

    console.log("<table>");
    console.log("<tr><th>Property</th><th>Value</th></tr>");

    for (var x in mp) {
        console.log("<tr><td>" + x + "</td><td>" + mp[x] + "</td></tr>");
    }

    console.log("</table>");
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