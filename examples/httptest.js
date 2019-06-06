var WoTimpl = require('../packages/core/wot-impl');
var WoT = new WoTimpl.default();

WoT.fetch("file://./httptest.json").then(function(td) {
    var thing = WoT.consume(td);
    // read property
    thing.properties.status.read().then(function(status) {
        console.log("Got ", status[0]);
    });
});
