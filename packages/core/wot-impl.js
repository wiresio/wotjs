"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//var Observable_1 = require("rxjs/Observable");
var TD = require("../td-tools/td-tools");
var exposed_thing_1 = require("./exposed-thing");
var consumed_thing_1 = require("./consumed-thing");
var helpers_1 = require("./helpers");
var content_serdes_1 = require("./content-serdes");
var Servient = require('./servient');
var FileClientFactory = require('../binding-file/file-client-factory');
var HttpClientFactory = require('../binding-http/http-client-factory');
var MqttClientFactory = require('../binding-mqtt/mqtt-client-factory');
var WoTImpl = (function () {
    function WoTImpl(srv) {
        this.srv = new Servient.default();
        this.srv.addClientFactory(new FileClientFactory.default());
        this.srv.addClientFactory(new HttpClientFactory.default());
        //this.srv.addClientFactory(new MqttClientFactory.default());
    }
    WoTImpl.prototype.discover = function (filter) {
        /*return new Observable_1.Observable(function (subscriber) {
            subscriber.complete();
        });*/
        return;
    };
    WoTImpl.prototype.fetch = function (uri) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var client = _this.srv.getClientFor(helpers_1.default.extractScheme(uri));
            console.info("WoTImpl fetching TD from '" + uri + "' with " + client);
            client.readResource(new TD.Form(uri, content_serdes_1.ContentSerdes.TD))
                .then(function (content) {
                client.stop();
                if (content.type !== content_serdes_1.ContentSerdes.TD &&
                    content.type !== content_serdes_1.ContentSerdes.JSON_LD) {
                    console.warn("WoTImpl received TD with media type '" + content.type + "' from " + uri);
                }
                var td = content.body.toString();
                try {
                    JSON.parse(td);
                }
                catch (err) {
                    console.warn("WoTImpl fetched invalid JSON from '" + uri + "': " + err.message);
                }
                resolve(content.body.toString());
            })
                .catch(function (err) { reject(err); });
        });
    };
    WoTImpl.prototype.consume = function (td) {
        var thing;
        try {
            thing = TD.parseTD(td, true);
        }
        catch (err) {
            throw new Error("Cannot consume TD because " + err.message);
        }
        var newThing = helpers_1.default.extend(thing, new consumed_thing_1.default(this.srv));
        newThing.extendInteractions();
        console.info("WoTImpl consuming TD " + (newThing.id ? "'" + newThing.id + "'" : "without id") + " to instantiate ConsumedThing '" + newThing.name + "'");
        return newThing;
    };
    WoTImpl.prototype.isWoTThingDescription = function (arg) {
        return arg.length !== undefined;
    };
    WoTImpl.prototype.isWoTThingFragment = function (arg) {
        return arg.name !== undefined;
    };
    WoTImpl.prototype.produce = function (model) {
        var newThing;
        if (this.isWoTThingDescription(model)) {
            var template = JSON.parse(model);
            newThing = helpers_1.default.extend(template, new exposed_thing_1.default(this.srv));
        }
        else if (this.isWoTThingFragment(model)) {
            var template = helpers_1.default.extend(model, new TD.Thing());
            newThing = helpers_1.default.extend(template, new exposed_thing_1.default(this.srv));
        }
        else {
            throw new Error("Invalid Thing model: " + model);
        }
        newThing.extendInteractions();
        console.info("WoTImpl producing new ExposedThing '" + newThing.name + "'");
        if (this.srv.addThing(newThing)) {
            return newThing;
        }
        else {
            throw new Error("Thing already exists: " + newThing.name);
        }
    };
    WoTImpl.prototype.register = function (directory, thing) {
        return new Promise(function (resolve, reject) {
            reject(new Error("WoT.register not implemented"));
        });
    };
    WoTImpl.prototype.unregister = function (directory, thing) {
        return new Promise(function (resolve, reject) {
            reject(new Error("WoT.unregister not implemented"));
        });
    };
    return WoTImpl;
}());
exports.default = WoTImpl;
var DiscoveryMethod;
(function (DiscoveryMethod) {
    DiscoveryMethod[DiscoveryMethod["any"] = 0] = "any";
    DiscoveryMethod[DiscoveryMethod["local"] = 1] = "local";
    DiscoveryMethod[DiscoveryMethod["directory"] = 2] = "directory";
    DiscoveryMethod[DiscoveryMethod["multicast"] = 3] = "multicast";
})(DiscoveryMethod = exports.DiscoveryMethod || (exports.DiscoveryMethod = {}));
var DataType;
(function (DataType) {
    DataType["boolean"] = "boolean";
    DataType["number"] = "number";
    DataType["integer"] = "integer";
    DataType["string"] = "string";
    DataType["object"] = "object";
    DataType["array"] = "array";
    DataType["null"] = "null";
})(DataType = exports.DataType || (exports.DataType = {}));
//# sourceMappingURL=wot-impl.js.map