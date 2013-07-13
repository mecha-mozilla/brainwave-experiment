/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const {Cc,Ci,Cr} = require("chrome");
const windows = require("window-utils");
const brainwave = require("brainwave.js");
const timers = require("timers");
const {Hotkey} = require("hotkeys");
const tabs = require("tabs");

const URLs = [
    "http://www.flickr.com/photos/cubagallery/4878886438/",
    "http://www.flickr.com/photos/cubagallery/3447420954/",
    "http://www.flickr.com/photos/cubagallery/4918358038/",
    "http://www.flickr.com/photos/cubagallery/3397838996/",
    "http://www.flickr.com/photos/cubagallery/3397026717/",
    "http://www.flickr.com/photos/cubagallery/3397839190/",
    "http://www.flickr.com/photos/earthworm/1278094187/",
    "http://www.flickr.com/photos/cubagallery/4488124371/",
    "http://www.flickr.com/photos/cubagallery/3391880008/",
    "http://www.flickr.com/photos/cubagallery/3391880304/",
    "http://www.flickr.com/photos/cubagallery/4693296436/",
    "http://www.flickr.com/photos/cubagallery/4485388695/",
    "http://www.flickr.com/photos/cubagallery/3467424365/",
    "http://www.flickr.com/photos/cubagallery/3446642817/",
    "http://www.flickr.com/photos/cubagallery/3391878192/",
    "http://www.flickr.com/photos/cubagallery/3741909101/",
    "http://www.flickr.com/photos/blind_beholder/5884351372/",
    "http://www.flickr.com/photos/45838224@N06/5279625012/",
    "http://www.flickr.com/photos/blind_beholder/5811308372/"
];

var current_index = 0;
var current_url;

const OPEN_FLAGS = {
    RDONLY: parseInt("0x01"),
    WRONLY: parseInt("0x02"),
    CREATE_FILE: parseInt("0x08"),
    APPEND: parseInt("0x10"),
    TRUNCATE: parseInt("0x20"),
    EXCL: parseInt("0x80")
};

const Logger = {
    init: function() {
        var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("Desk", Ci.nsIFile);  
        file.append("brainwave.log");
        Logger.out = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
        Logger.out.init(file, OPEN_FLAGS.CREATE_FILE | OPEN_FLAGS.WRONLY | OPEN_FLAGS.APPEND, parseInt("0777"), false);
    },
    
    log: function(line) {
        console.log(line);
        line += "\n";
        Logger.out.write(line, line.length);
    }
}

function observe() {
    if (current_index == 20) {
        return;
    }
    if (!windows.activeWindow.gBrowser) {
        timers.setTimeout(observe, 100);
        return;
    }
    var url = windows.activeWindow.gBrowser.currentURI.spec;
    if (current_url != url) {
        current_url = url;
        Logger.log("1,"+url);
    }

    var packetCount = brainwave.readPackets();
    if (packetCount > 0) {
        var attention = brainwave.getAttention();
        var meditation = brainwave.getMeditation();
        var delta = brainwave.getDelta();
        var theta = brainwave.getTheta();
        var lowAlpha = brainwave.getLowAlpha();
        var highAlpha = brainwave.getHighAlpha();
        var lowBeta = brainwave.getLowBeta();
        var highBeta = brainwave.getHighBeta();
        var lowGamma = brainwave.getLowGamma();
        var highGamma = brainwave.getHighGamma();
        Logger.log("2,"+attention+","+meditation+","+delta+","+theta+","+lowAlpha+","+highAlpha+","+lowBeta+","+highBeta+","+lowGamma+","+highGamma);
    }

    timers.setTimeout(observe, 100);
}

function next() {
    current_index += 1;
    if (current_index == 20) {
        Logger.log("4,END");
        return;
    }
    var url = URLs[current_index];
    tabs.activeTab.url = url;
}

Hotkey({
    combo: "accel-1",
    onPress: function() {
        Logger.log("3,1");
        next();
    }
});

Hotkey({
    combo: "accel-2",
    onPress: function() {
        Logger.log("3,2");
        next();
    }
});

Hotkey({
    combo: "accel-3",
    onPress: function() {
        Logger.log("3,3");
        next();
    }
});

Logger.init();
brainwave.open();
observe();
tabs.open(URLs[current_index]);
