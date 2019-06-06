"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var http = require("http");
var https = require("https");
//var bauth = require("basic-auth");  //TODO basic authentication
var url = require("../common/url");
var TD = require("../td-tools/td-tools");
var core_1 = require("../core/core");
var HttpServer = (function () {
    function HttpServer(config) {
        if (config === void 0) { config = {}; }
        var _this = this;
        this.ALL_DIR = "all";
        this.ALL_PROPERTIES = "properties";
        this.PROPERTY_DIR = "properties";
        this.ACTION_DIR = "actions";
        this.EVENT_DIR = "events";
        this.OBSERVABLE_DIR = "observable";
        this.OPTIONS_URI_VARIABLES = 'uriVariables';
        this.port = 8080;
        this.address = undefined;
        this.securityScheme = "NoSec";
        this.server = null;
        this.things = new Map();
        this.servient = null;
        if (typeof config !== "object") {
            throw new Error("HttpServer requires config object (got " + typeof config + ")");
        }
        if (config.port !== undefined) {
            this.port = config.port;
        }
        if (config.address !== undefined) {
            this.address = config.address;
        }
        if (config.serverKey && config.serverCert) {
            var options = {};
            options.key = fs.readFileSync(config.serverKey);
            options.cert = fs.readFileSync(config.serverCert);
            this.scheme = "https";
            this.server = https.createServer(options, function (req, res) { _this.handleRequest(req, res); });
        }
        else {
            this.scheme = "http";
            this.server = http.createServer(function (req, res) { _this.handleRequest(req, res); });
        }
        if (config.security) {
            if (this.scheme !== "https") {
                throw new Error("HttpServer does not allow security without TLS (HTTPS)");
            }
            switch (config.security.scheme) {
                case "basic":
                    this.securityScheme = "Basic";
                    break;
                case "digest":
                    this.securityScheme = "Digest";
                    break;
                case "bearer":
                    this.securityScheme = "Bearer";
                    break;
                default:
                    throw new Error("HttpServer does not support security scheme '" + config.security.scheme);
            }
        }
    }
    HttpServer.prototype.start = function (servient) {
        var _this = this;
        console.info("HttpServer starting on " + (this.address !== undefined ? this.address + ' ' : '') + "port " + this.port);
        return new Promise(function (resolve, reject) {
            _this.servient = servient;
            _this.server.setTimeout(60 * 60 * 1000, function () { console.info("HttpServer on port " + _this.getPort() + " timed out connection"); });
            _this.server.keepAliveTimeout = 0;
            _this.server.once('error', function (err) { reject(err); });
            _this.server.once('listening', function () {
                _this.server.on('error', function (err) {
                    console.error("HttpServer on port " + _this.port + " failed: " + err.message);
                });
                resolve();
            });
            _this.server.listen(_this.port, _this.address);
        });
    };
    HttpServer.prototype.stop = function () {
        var _this = this;
        console.info("HttpServer stopping on port " + this.getPort());
        return new Promise(function (resolve, reject) {
            _this.server.once('error', function (err) { reject(err); });
            _this.server.once('close', function () { resolve(); });
            _this.server.close();
        });
    };
    HttpServer.prototype.getServer = function () {
        return this.server;
    };
    HttpServer.prototype.getPort = function () {
        if (this.server.address() && typeof this.server.address() === "object") {
            return this.server.address().port;
        }
        else {
            return -1;
        }
    };
    HttpServer.prototype.updateInteractionNameWithUriVariablePattern = function (interactionName, uriVariables) {
        if (uriVariables && Object.keys(uriVariables).length > 0) {
            var pattern = "{?";
            var index = 0;
            for (var key in uriVariables) {
                if (index != 0) {
                    pattern += ",";
                }
                pattern += encodeURIComponent(key);
                index++;
            }
            pattern += "}";
            return encodeURIComponent(interactionName) + pattern;
        }
        else {
            return encodeURIComponent(interactionName);
        }
    };
    HttpServer.prototype.expose = function (thing) {
        var name = thing.name;
        if (this.things.has(name)) {
            name = core_1.Helpers.generateUniqueName(name);
        }
        if (this.getPort() !== -1) {
            console.log("HttpServer on port " + this.getPort() + " exposes '" + thing.name + "' as unique '/" + name + "'");
            this.things.set(name, thing);
            for (var _i = 0, _a = core_1.Helpers.getAddresses(); _i < _a.length; _i++) {
                var address = _a[_i];
                for (var _b = 0, _c = core_1.ContentSerdes.get().getOfferedMediaTypes(); _b < _c.length; _b++) {
                    var type = _c[_b];
                    var base = this.scheme + "://" + address + ":" + this.getPort() + "/" + encodeURIComponent(name);
                    if (true) {
                        var href = base + "/" + this.ALL_DIR + "/" + encodeURIComponent(this.ALL_PROPERTIES);
                        var form = new TD.Form(href, type);
                        if (!thing.forms) {
                            thing.forms = [];
                        }
                        thing.forms.push(form);
                    }
                    for (var propertyName in thing.properties) {
                        var propertyNamePattern = this.updateInteractionNameWithUriVariablePattern(propertyName, thing.properties[propertyName].uriVariables);
                        var href = base + "/" + this.PROPERTY_DIR + "/" + propertyNamePattern;
                        var form = new TD.Form(href, type);
                        if (thing.properties[propertyName].readOnly) {
                            form.op = ["readproperty"];
                        }
                        else if (thing.properties[propertyName].writeOnly) {
                            form.op = ["writeproperty"];
                        }
                        else {
                            form.op = ["readproperty", "writeproperty"];
                        }
                        thing.properties[propertyName].forms.push(form);
                        console.log("HttpServer on port " + this.getPort() + " assigns '" + href + "' to Property '" + propertyName + "'");
                        if (thing.properties[propertyName].observable) {
                            var href_1 = base + "/" + this.PROPERTY_DIR + "/" + encodeURIComponent(propertyName) + "/" + this.OBSERVABLE_DIR;
                            var form_1 = new TD.Form(href_1, type);
                            form_1.op = ["observeproperty"];
                            form_1.subprotocol = "longpoll";
                            thing.properties[propertyName].forms.push(form_1);
                            console.log("HttpServer on port " + this.getPort() + " assigns '" + href_1 + "' to observable Property '" + propertyName + "'");
                        }
                    }
                    for (var actionName in thing.actions) {
                        var actionNamePattern = this.updateInteractionNameWithUriVariablePattern(actionName, thing.actions[actionName].uriVariables);
                        var href = base + "/" + this.ACTION_DIR + "/" + actionNamePattern;
                        var form = new TD.Form(href, type);
                        form.op = ["invokeaction"];
                        thing.actions[actionName].forms.push(form);
                        console.log("HttpServer on port " + this.getPort() + " assigns '" + href + "' to Action '" + actionName + "'");
                    }
                    for (var eventName in thing.events) {
                        var eventNamePattern = this.updateInteractionNameWithUriVariablePattern(eventName, thing.events[eventName].uriVariables);
                        var href = base + "/" + this.EVENT_DIR + "/" + eventNamePattern;
                        var form = new TD.Form(href, type);
                        form.subprotocol = "longpoll";
                        form.op = ["subscribeevent"];
                        thing.events[eventName].forms.push(form);
                        console.log("HttpServer on port " + this.getPort() + " assigns '" + href + "' to Event '" + eventName + "'");
                    }
                }
            }
            if (this.scheme === "https") {
                thing.securityDefinitions = {
                    "basic_sc": { "scheme": "basic", "in": "header" }
                };
                thing.security = ["basic_sc"];
            }
        }
        return new Promise(function (resolve, reject) {
            resolve();
        });
    };
    HttpServer.prototype.checkCredentials = function (id, req) {
        console.log("HttpServer on port " + this.getPort() + " checking credentials for '" + id + "'");
        var creds = this.servient.getCredentials(id);
        switch (this.securityScheme) {
            case "Basic":
                //var basic = bauth(req);
                //return (creds !== undefined) &&
                //    (basic !== undefined) &&
                //    (basic.name === creds.username && basic.pass === creds.password);
                return false;
            case "Digest":
                return false;
            case "Bearer":
                if (req.headers["authorization"] === undefined)
                    return false;
                var auth = req.headers["authorization"].split(" ");
                return (auth[0] === "Bearer") &&
                    (creds !== undefined) &&
                    (auth[1] === creds.token);
            default:
                return false;
        }
    };
    HttpServer.prototype.parseUrlParameters = function (url, uriVariables) {
        var params = {};
        if (url == null || !uriVariables) {
            return params;
        }
        var queryparams = url.split('?')[1];
        if (queryparams == null) {
            return params;
        }
        var queries = queryparams.split("&");
        queries.forEach(function (indexQuery) {
            var indexPair = indexQuery.split("=");
            var queryKey = decodeURIComponent(indexPair[0]);
            var queryValue = decodeURIComponent(indexPair.length > 1 ? indexPair[1] : "");
            if (uriVariables[queryKey].type === "integer" || uriVariables[queryKey].type === "number") {
                params[queryKey] = +queryValue;
            }
            else {
                params[queryKey] = queryValue;
            }
        });
        return params;
    };
    HttpServer.prototype.handleRequest = function (req, res) {
        var _this = this;
        var requestUri = url.parse(req.url);
        console.log("HttpServer on port " + this.getPort() + " received '" + req.method + " " + requestUri.pathname + "' from " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
        res.on("finish", function () {
            console.log("HttpServer on port " + _this.getPort() + " replied with '" + res.statusCode + "' to " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
        });
        function respondUnallowedMethod(res, allowed) {
            if (!allowed.includes("OPTIONS")) {
                allowed += ", OPTIONS";
            }
            if (req.method === "OPTIONS" && req.headers["origin"] && req.headers["access-control-request-method"]) {
                console.debug("HttpServer received an CORS preflight request from " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
                res.setHeader("Access-Control-Allow-Methods", allowed);
                res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, *");
                res.writeHead(200);
                res.end();
            }
            else {
                res.setHeader("Allow", allowed);
                res.writeHead(405);
                res.end("Method Not Allowed");
            }
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        var contentTypeHeader = req.headers["content-type"];
        var contentType = Array.isArray(contentTypeHeader) ? contentTypeHeader[0] : contentTypeHeader;
        if (req.method === "PUT" || req.method === "POST") {
            if (!contentType) {
                console.warn("HttpServer on port " + this.getPort() + " received no Content-Type from " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
                contentType = core_1.ContentSerdes.DEFAULT;
            }
            else if (core_1.ContentSerdes.get().getSupportedMediaTypes().indexOf(core_1.ContentSerdes.getMediaType(contentType)) < 0) {
                res.writeHead(415);
                res.end("Unsupported Media Type");
                return;
            }
        }
        var segments = requestUri.pathname.split("/");
        if (segments[1] === "") {
            if (req.method === "GET") {
                res.setHeader("Content-Type", core_1.ContentSerdes.DEFAULT);
                res.writeHead(200);
                var list = [];
                for (var _i = 0, _a = core_1.Helpers.getAddresses(); _i < _a.length; _i++) {
                    var address = _a[_i];
                    for (var _b = 0, _c = Array.from(this.things.keys()); _b < _c.length; _b++) {
                        var name_1 = _c[_b];
                        list.push(this.scheme + "://" + core_1.Helpers.toUriLiteral(address) + ":" + this.getPort() + "/" + encodeURIComponent(name_1));
                    }
                }
                res.end(JSON.stringify(list));
            }
            else {
                respondUnallowedMethod(res, "GET");
            }
            return;
        }
        else {
            var thing_1 = this.things.get(segments[1]);
            if (thing_1) {
                if (segments.length === 2 || segments[2] === "") {
                    if (req.method === "GET") {
                        res.setHeader("Content-Type", core_1.ContentSerdes.TD);
                        res.writeHead(200);
                        res.end(thing_1.getThingDescription());
                    }
                    else {
                        respondUnallowedMethod(res, "GET");
                    }
                    return;
                }
                else {
                    if (this.securityScheme !== "NoSec" && !this.checkCredentials(thing_1.id, req)) {
                        res.setHeader("WWW-Authenticate", this.securityScheme + " realm=\"" + thing_1.id + "\"");
                        res.writeHead(401);
                        res.end();
                        return;
                    }
                    if (segments[2] === this.ALL_DIR) {
                        if (this.ALL_PROPERTIES == segments[3]) {
                            if (req.method === "GET") {
                                var obj_1 = {};
                                var promises = [];
                                for (var key in thing_1.properties) {
                                    var property = thing_1.properties[key].read();
                                    promises.push(property);
                                }
                                Promise.all(promises)
                                    .then(function (value) {
                                    var index = 0;
                                    for (var key in thing_1.properties) {
                                        obj_1[key] = value[index];
                                        index++;
                                    }
                                    res.writeHead(200);
                                    res.end(JSON.stringify(obj_1));
                                })
                                    .catch(function (err) {
                                    console.error("HttpServer on port " + _this.getPort() + " got internal error on read '" + requestUri.pathname + "': " + err.message);
                                    res.writeHead(500);
                                    res.end(err.message);
                                });
                            }
                            else {
                                respondUnallowedMethod(res, "GET");
                            }
                            return;
                        }
                    }
                    else if (segments[2] === this.PROPERTY_DIR) {
                        var property_1 = thing_1.properties[segments[3]];
                        if (property_1) {
                            var params = this.parseUrlParameters(req.url, property_1.uriVariables);
                            var options_1 = {};
                            options_1[this.OPTIONS_URI_VARIABLES] = params;
                            if (req.method === "GET") {
                                if (segments[4] === this.OBSERVABLE_DIR) {
                                    res.setHeader("Content-Type", core_1.ContentSerdes.DEFAULT);
                                    res.writeHead(200);
                                    var subscription_1 = property_1.subscribe(function (data) {
                                        var content;
                                        try {
                                            content = core_1.ContentSerdes.get().valueToContent(data, property_1.data);
                                        }
                                        catch (err) {
                                            console.warn("HttpServer on port " + _this.getPort() + " cannot process data for Event '" + segments[3] + ": " + err.message + "'");
                                            res.writeHead(500);
                                            res.end("Invalid Event Data");
                                            return;
                                        }
                                        res.end(content.body);
                                    }, function () { return res.end(); }, function () { return res.end(); });
                                    res.on("finish", function () {
                                        console.debug("HttpServer on port " + _this.getPort() + " closed Event connection");
                                        subscription_1.unsubscribe();
                                    });
                                    res.setTimeout(60 * 60 * 1000, function () { return subscription_1.unsubscribe(); });
                                }
                                else {
                                    property_1.read(options_1)
                                        .then(function (value) {
                                        var content = core_1.ContentSerdes.get().valueToContent(value, property_1);
                                        res.setHeader("Content-Type", content.type);
                                        res.writeHead(200);
                                        res.end(content.body);
                                    })
                                        .catch(function (err) {
                                        console.error("HttpServer on port " + _this.getPort() + " got internal error on read '" + requestUri.pathname + "': " + err.message);
                                        res.writeHead(500);
                                        res.end(err.message);
                                    });
                                }
                            }
                            else if (req.method === "PUT") {
                                if (!property_1.readOnly) {
                                    var body_1 = [];
                                    req.on("data", function (data) { body_1.push(data); });
                                    req.on("end", function () {
                                        console.debug("HttpServer on port " + _this.getPort() + " completed body '" + body_1 + "'");
                                        var value;
                                        try {
                                            value = core_1.ContentSerdes.get().contentToValue({ type: contentType, body: Buffer.concat(body_1) }, property_1);
                                        }
                                        catch (err) {
                                            console.warn("HttpServer on port " + _this.getPort() + " cannot process write value for Property '" + segments[3] + ": " + err.message + "'");
                                            res.writeHead(400);
                                            res.end("Invalid Data");
                                            return;
                                        }
                                        property_1.write(value, options_1)
                                            .then(function () {
                                            res.writeHead(204);
                                            res.end("Changed");
                                        })
                                            .catch(function (err) {
                                            console.error("HttpServer on port " + _this.getPort() + " got internal error on write '" + requestUri.pathname + "': " + err.message);
                                            res.writeHead(500);
                                            res.end(err.message);
                                        });
                                    });
                                }
                                else {
                                    res.writeHead(400);
                                    res.end("Property readOnly");
                                }
                            }
                            else {
                                respondUnallowedMethod(res, "GET, PUT");
                            }
                            return;
                        }
                    }
                    else if (segments[2] === this.ACTION_DIR) {
                        var action_1 = thing_1.actions[segments[3]];
                        if (action_1) {
                            if (req.method === "POST") {
                                var body_2 = [];
                                req.on("data", function (data) { body_2.push(data); });
                                req.on("end", function () {
                                    console.debug("HttpServer on port " + _this.getPort() + " completed body '" + body_2 + "'");
                                    var input;
                                    try {
                                        input = core_1.ContentSerdes.get().contentToValue({ type: contentType, body: Buffer.concat(body_2) }, action_1.input);
                                    }
                                    catch (err) {
                                        console.warn("HttpServer on port " + _this.getPort() + " cannot process input to Action '" + segments[3] + ": " + err.message + "'");
                                        res.writeHead(400);
                                        res.end("Invalid Input Data");
                                        return;
                                    }
                                    var params = _this.parseUrlParameters(req.url, action_1.uriVariables);
                                    var options = {};
                                    options[_this.OPTIONS_URI_VARIABLES] = params;
                                    action_1.invoke(input, options)
                                        .then(function (output) {
                                        if (output) {
                                            var content = core_1.ContentSerdes.get().valueToContent(output, action_1.output);
                                            res.setHeader("Content-Type", content.type);
                                            res.writeHead(200);
                                            res.end(content.body);
                                        }
                                        else {
                                            res.writeHead(200);
                                            res.end();
                                        }
                                    })
                                        .catch(function (err) {
                                        console.error("HttpServer on port " + _this.getPort() + " got internal error on invoke '" + requestUri.pathname + "': " + err.message);
                                        res.writeHead(500);
                                        res.end(err.message);
                                    });
                                });
                            }
                            else {
                                respondUnallowedMethod(res, "POST");
                            }
                            return;
                        }
                    }
                    else if (segments[2] === this.EVENT_DIR) {
                        var event_1 = thing_1.events[segments[3]];
                        if (event_1) {
                            if (req.method === "GET") {
                                res.setHeader("Content-Type", core_1.ContentSerdes.DEFAULT);
                                res.writeHead(200);
                                var subscription_2 = event_1.subscribe(function (data) {
                                    var content;
                                    try {
                                        content = core_1.ContentSerdes.get().valueToContent(data, event_1.data);
                                    }
                                    catch (err) {
                                        console.warn("HttpServer on port " + _this.getPort() + " cannot process data for Event '" + segments[3] + ": " + err.message + "'");
                                        res.writeHead(500);
                                        res.end("Invalid Event Data");
                                        return;
                                    }
                                    res.end(content.body);
                                }, function () { return res.end(); }, function () { return res.end(); });
                                res.on("finish", function () {
                                    console.debug("HttpServer on port " + _this.getPort() + " closed Event connection");
                                    subscription_2.unsubscribe();
                                });
                                res.setTimeout(60 * 60 * 1000, function () { return subscription_2.unsubscribe(); });
                            }
                            else {
                                respondUnallowedMethod(res, "GET");
                            }
                            return;
                        }
                    }
                }
            }
        }
        res.writeHead(404);
        res.end("Not Found");
    };
    return HttpServer;
}());
exports.default = HttpServer;
//# sourceMappingURL=http-server.js.map