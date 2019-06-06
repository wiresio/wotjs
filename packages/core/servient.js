"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//var vm = require("vm");
var wot_impl_1 = require("./wot-impl");
var content_serdes_1 = require("./content-serdes");
var Servient = (function () {
    function Servient() {
        this.servers = [];
        this.clientFactories = {};
        this.things = {};
        this.credentialStore = {};
    }
    /*Servient.prototype.runScript = function (code, filename) {
        var _this = this;
        if (filename === void 0) { filename = 'script'; }
        var script;
        try {
            script = new vm.Script(code);
        }
        catch (err) {
            var scriptPosition = err.stack.match(/evalmachine\.<anonymous>\:([0-9]+)\n/)[1];
            console.error("Servient found error in '" + filename + "' at line " + scriptPosition + "\n    " + err);
            return;
        }
        var context = vm.createContext({
            "WoT": new wot_impl_1.default(this),
            "console": console,
            "setInterval": function (handler, ms) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                return setInterval(function () {
                    try {
                        handler(args);
                    }
                    catch (err) {
                        _this.logScriptError("async error in setInterval() in '" + filename + "'", err);
                    }
                }, ms);
            },
            "clearInterval": clearInterval,
            "setTimeout": function (handler, ms) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                return setTimeout(function () {
                    try {
                        handler(args);
                    }
                    catch (err) {
                        _this.logScriptError("async error in setTimeout() in '" + filename + "'", err);
                    }
                }, ms);
            },
            "clearTimeout": clearTimeout,
            "setImmediate": function (handler) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return setImmediate(function () {
                    try {
                        handler(args);
                    }
                    catch (err) {
                        _this.logScriptError("async error in setImmediate() in '" + filename + "'", err);
                    }
                });
            },
            "clearImmediate": clearImmediate
        });
        var options = {
            "filename": filename,
            "displayErrors": true
        };
        try {
            script.runInContext(context, options);
        }
        catch (err) {
            this.logScriptError("error in '" + filename + "'", err);
        }
    };*/
    /*Servient.prototype.runPrivilegedScript = function (code, filename) {
        var _this = this;
        if (filename === void 0) { filename = 'script'; }
        var script;
        try {
            script = new vm.Script(code);
        }
        catch (err) {
            var scriptPosition = err.stack.match(/evalmachine\.<anonymous>\:([0-9]+)\n/)[1];
            console.error("Servient found error in privileged script '" + filename + "' at line " + scriptPosition + "\n    " + err);
            return;
        }
        var context = vm.createContext({
            "WoT": new wot_impl_1.default(this),
            "console": console,
            "setInterval": function (handler, ms) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                return setInterval(function () {
                    try {
                        handler(args);
                    }
                    catch (err) {
                        _this.logScriptError("async error in setInterval() in privileged '" + filename + "'", err);
                    }
                }, ms);
            },
            "clearInterval": clearInterval,
            "setTimeout": function (handler, ms) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                return setTimeout(function () {
                    try {
                        handler(args);
                    }
                    catch (err) {
                        _this.logScriptError("async error in setTimeout() in privileged '" + filename + "'", err);
                    }
                }, ms);
            },
            "clearTimeout": clearTimeout,
            "setImmediate": function (handler) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return setImmediate(function () {
                    try {
                        handler(args);
                    }
                    catch (err) {
                        _this.logScriptError("async error in setImmediate() in privileged '" + filename + "'", err);
                    }
                });
            },
            "clearImmediate": clearImmediate,
            "require": require
        });
        var options = {
            "filename": filename,
            "displayErrors": true
        };
        try {
            script.runInContext(context, options);
        }
        catch (err) {
            this.logScriptError("error in privileged '" + filename + "'", err);
        }
    };
    Servient.prototype.logScriptError = function (description, error) {
        var message;
        if (typeof error === "object" && error.stack) {
            var match = error.stack.match(/evalmachine\.<anonymous>\:([0-9]+\:[0-9]+)/);
            if (Array.isArray(match)) {
                message = "and halted at line " + match[1] + "\n    " + error;
            }
            else {
                message = "and halted with " + error.stack;
            }
        }
        else {
            message = "that threw " + typeof error + " instead of Error\n    " + error;
        }
        console.error("Servient caught " + description + " " + message);
    };
    Servient.prototype.addMediaType = function (codec, offered) {
        if (offered === void 0) { offered = false; }
        content_serdes_1.default.addCodec(codec, offered);
    };
    Servient.prototype.expose = function (thing) {
        if (this.servers.length === 0) {
            console.warn("Servient has no servers to expose Things");
            return new Promise(function (resolve) { resolve(); });
        }
        console.log("Servient exposing '" + thing.name + "'");
        thing.forms = [];
        for (var name_1 in thing.properties) {
            thing.properties[name_1].forms = [];
        }
        for (var name_2 in thing.actions) {
            thing.actions[name_2].forms = [];
        }
        for (var name_3 in thing.events) {
            thing.events[name_3].forms = [];
        }
        var serverPromises = [];
        this.servers.forEach(function (server) { serverPromises.push(server.expose(thing)); });
        return new Promise(function (resolve, reject) {
            Promise.all(serverPromises).then(function () { return resolve(); }).catch(function (err) { return reject(err); });
        });
    };
    Servient.prototype.addThing = function (thing) {
        if (thing.id === undefined) {
            console.warn("Servient generating ID for '" + thing.name + "'");
            thing.id = "urn:uuid:" + require("uuid").v4();
        }
        if (!this.things.has(thing.id)) {
            this.things.set(thing.id, thing);
            return true;
        }
        else {
            return false;
        }
    };
    Servient.prototype.getThing = function (name) {
        if (this.things.has(name)) {
            return this.things.get(name);
        }
        else
            return null;
    };
    Servient.prototype.addServer = function (server) {
        this.things.forEach(function (thing, id) { return server.expose(thing); });
        this.servers.push(server);
        return true;
    };
    Servient.prototype.getServers = function () {
        return this.servers.slice(0);
    };*/
    Servient.prototype.addClientFactory = function (clientFactory) {
        this.clientFactories[clientFactory.scheme] = clientFactory;
    };
    Servient.prototype.hasClientFor = function (scheme) {
        console.debug("Servient checking for '" + scheme + "' scheme in " + this.clientFactories.size + " ClientFactories");
        return this.clientFactories.has(scheme);
    };
    Servient.prototype.getClientFor = function (scheme) {
        if (scheme in this.clientFactories) {
            console.info("Servient creating client for scheme '" + scheme + "'");
            return this.clientFactories[scheme].getClient();
        }
        else {
            throw new Error("Servient has no ClientFactory for scheme '" + scheme + "'");
        }
    };
    /*Servient.prototype.getClientSchemes = function () {
        return Array.from(this.clientFactories.keys());
    };
    Servient.prototype.addCredentials = function (credentials) {
        if (typeof credentials === "object") {
            for (var i in credentials) {
                console.log("Servient storing credentials for '" + i + "'");
                this.credentialStore.set(i, credentials[i]);
            }
        }
    };
    Servient.prototype.getCredentials = function (identifier) {
        console.log("Servient looking up credentials for '" + identifier + "'");
        return this.credentialStore.get(identifier);
    };
    Servient.prototype.start = function () {
        var _this = this;
        var serverStatus = [];
        this.servers.forEach(function (server) { return serverStatus.push(server.start(_this)); });
        this.clientFactories.forEach(function (clientFactory) { return clientFactory.init(); });
        return new Promise(function (resolve, reject) {
            Promise.all(serverStatus)
                .then(function () {
                resolve(new wot_impl_1.default(_this));
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    Servient.prototype.shutdown = function () {
        this.clientFactories.forEach(function (clientFactory) { return clientFactory.destroy(); });
        this.servers.forEach(function (server) { return server.stop(); });
    };*/
    return Servient;
}());
exports.default = Servient;
//# sourceMappingURL=servient.js.map