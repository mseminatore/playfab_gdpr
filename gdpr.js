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

/**
 * {
 *   data: Buffer,
 *   mode: Number,
 *   mtime: String,
 *   path: String,
 *   type: String
 * }
 */

/**
 * @function process a PlayFab GDPR ZIP file
 */
exports.process = function process(filename) {
    decompress(filename).then(files => {
        console.error("The archive contains " + files.length + " files\n");
        console.log("<html><body>");
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            if (path.basename(file.path) == "master_player_export.json") {
                console.error("Found master player file!");
                var mp = JSON.parse(file.data.toString());

                // console.log(mp["SchemaVersion"]);

                // for (var x in mp) {
                //     console.log(x);
                // }

                console.log("<table border='1'>");
                for (var x in mp) {
                    console.log("<tr><td>" + x + "</td><td>" + mp[x] + "</td></tr>");
                }
                console.log("</table>")        

                // console.log(mp);
            }

//            console.log(file.path, file.type);
        }
        console.log("</body></html>");

        console.error('All done!');
    });
}