"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var https = require("https");
var url = require("../common/url");
//var Subscription_1 = require("rxjs/Subscription"); //TODO subscriptions
var HttpClient = (function () {
    function HttpClient(config, secure) {
        if (config === void 0) { config = null; }
        if (secure === void 0) { secure = false; }
        this.proxyOptions = null;
        this.authorization = null;
        this.authorizationHeader = "Authorization";
        this.allowSelfSigned = false;
        if (config !== null && config.proxy && config.proxy.href) {
            this.proxyOptions = this.uriToOptions(config.proxy.href);
            if (config.proxy.scheme === "basic") {
                if (!config.proxy.hasOwnProperty("username") || !config.proxy.hasOwnProperty("password"))
                    console.warn("HttpClient client configured for basic proxy auth, but no username/password given");
                this.proxyOptions.headers = {};
                this.proxyOptions.headers['Proxy-Authorization'] = "Basic " + Buffer.from(config.proxy.username + ":" + config.proxy.password).toString('base64');
            }
            else if (config.proxy.scheme === "bearer") {
                if (!config.proxy.hasOwnProperty("token"))
                    console.warn("HttpClient client configured for bearer proxy auth, but no token given");
                this.proxyOptions.headers = {};
                this.proxyOptions.headers['Proxy-Authorization'] = "Bearer " + config.proxy.token;
            }
            if (this.proxyOptions.protocol === "https") {
                secure = true;
            }
            console.info("HttpClient using " + (secure ? "secure " : "") + "proxy " + this.proxyOptions.hostname + ":" + this.proxyOptions.port);
        }
        if (config !== null && config.allowSelfSigned !== undefined) {
            this.allowSelfSigned = config.allowSelfSigned;
            console.warn("HttpClient allowing self-signed/untrusted certificates -- USE FOR TESTING ONLY");
        }
        //TODO
        //this.agent = secure ? new https.Agent() : new http.Agent();
        //this.provider = secure ? https : http;
        this.provider = http;
    }
    HttpClient.prototype.getContentType = function (res) {
        var header = res.headers['content-type'];
        if (Array.isArray(header)) {
            return (header.length > 0) ? header[0] : "";
        }
        else {
            return header;
        }
    };
    HttpClient.prototype.toString = function () {
        return "[HttpClient]";
    };
    HttpClient.prototype.readResource = function (form) {
        var _this = this;
        return new Promise(function (resolve, reject) {
/*TODO
            var req = _this.generateRequest(form, "GET");
            var info = req;
            console.log("HttpClient sending " + info.method + " to " + form.href);
            req.on("response", function (res) {
                console.log("HttpClient received " + res.statusCode + " from " + form.href);
                var contentType = _this.getContentType(res);
                var body = [];
                res.on('data', function (data) { body.push(data); });
                res.on('end', function () {
                    _this.checkResponse(res.statusCode, contentType, Buffer.concat(body), resolve, reject);
                });
            });
            req.on("error", function (err) { return reject(err); });
            req.end();
*/
            var options = _this.uriToOptions(form.href);
            options.method = 'GET';
            console.log("HttpClient sending " + options.method + " " + options.path + " to " + options.hostname + ":" + options.port);
            var req = _this.provider.request(options, function (res) {
                console.log("HttpClient received " + res.statusCode + " from " + options.path);
                var contentType = 'application/json'; //_this.getContentType(res);
                var body = [];
                res.on('data', function (data) { body.push(data); });
                res.on('end', function () {
                    //_this.checkResponse(res.statusCode, contentType, Buffer.concat(body), resolve, reject);
                    resolve({ type: contentType, body: Buffer.concat(body) });
                });
            });
            req.on('error', function (err) { return reject(err); });
            req.end();
        });
    };
    HttpClient.prototype.writeResource = function (form, content) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var req = _this.generateRequest(form, "PUT");
            var info = req;
            req.setHeader("Content-Type", content.type);
            req.setHeader("Content-Length", content.body.byteLength);
            console.log("HttpClient sending " + info.method + " with '" + req.getHeader("Content-Type") + "' to " + form.href);
            req.on("response", function (res) {
                console.log("HttpClient received " + res.statusCode + " from " + form.href);
                var contentType = _this.getContentType(res);
                var body = [];
                res.on('data', function (data) { body.push(data); });
                res.on('end', function () {
                    _this.checkResponse(res.statusCode, contentType, Buffer.concat(body), resolve, reject);
                });
            });
            req.on('error', function (err) { return reject(err); });
            req.write(content.body);
            req.end();
        });
    };
    HttpClient.prototype.invokeResource = function (form, content) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var req = _this.generateRequest(form, "POST");
            var info = req;
            if (content) {
                req.setHeader("Content-Type", content.type);
                req.setHeader("Content-Length", content.body.byteLength);
            }
            console.log("HttpClient sending " + info.method + " " + (content ? "with '" + req.getHeader("Content-Type") + "' " : " ") + "to " + form.href);
            req.on("response", function (res) {
                console.log("HttpClient received " + res.statusCode + " from " + form.href);
                var contentType = _this.getContentType(res);
                console.debug("HttpClient received Content-Type: " + contentType);
                var body = [];
                res.on('data', function (data) { body.push(data); });
                res.on('end', function () {
                    _this.checkResponse(res.statusCode, contentType, Buffer.concat(body), resolve, reject);
                });
            });
            req.on("error", function (err) { return reject(err); });
            if (content) {
                req.write(content.body);
            }
            req.end();
        });
    };
    HttpClient.prototype.unlinkResource = function (form) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var req = _this.generateRequest(form, "DELETE");
            var info = req;
            console.log("HttpClient sending " + info.method + " to " + form.href);
            req.on("response", function (res) {
                console.log("HttpClient received " + res.statusCode + " from " + form.href);
                var contentType = _this.getContentType(res);
                var body = [];
                res.on('data', function (data) { body.push(data); });
                res.on('end', function () {
                    _this.checkResponse(res.statusCode, contentType, Buffer.concat(body), resolve, reject);
                });
            });
            req.on('error', function (err) { return reject(err); });
            req.end();
        });
    };
    /*HttpClient.prototype.subscribeResource = function (form, next, error, complete) {
        var _this = this;
        var active = true;
        var polling = function () {
            var req = _this.generateRequest(form, "GET");
            var info = req;
            req.setTimeout(60 * 60 * 1000);
            console.log("HttpClient sending " + info.method + " to " + form.href);
            req.on("response", function (res) {
                console.log("HttpClient received " + res.statusCode + " from " + form.href);
                var contentType = _this.getContentType(res);
                var body = [];
                res.on("data", function (data) { body.push(data); });
                res.on("end", function () {
                    if (active) {
                        _this.checkResponse(res.statusCode, contentType, Buffer.concat(body), next, error);
                        polling();
                    }
                });
            });
            req.on("error", function (err) { return error(err); });
            req.flushHeaders();
            req.end();
        };
        polling();
        return new Subscription_1.Subscription(function () { active = false; });
    };*/
    HttpClient.prototype.start = function () {
        return true;
    };
    HttpClient.prototype.stop = function () {
        if (this.agent && this.agent.destroy)
            this.agent.destroy();
        return true;
    };
    HttpClient.prototype.setSecurity = function (metadata, credentials) {
        if (metadata === undefined || !Array.isArray(metadata) || metadata.length == 0) {
            console.warn("HttpClient without security");
            return false;
        }
        if (credentials === undefined) {
            throw new Error("No credentionals for Thing");
        }
        var security = metadata[0];
        if (security.scheme === "basic") {
            this.authorization = "Basic " + Buffer.from(credentials.username + ":" + credentials.password).toString('base64');
        }
        else if (security.scheme === "bearer") {
            this.authorization = "Bearer " + credentials.token;
        }
        else if (security.scheme === "apikey") {
            this.authorization = credentials.apikey;
            if (security.in === "header" && security.name !== undefined) {
                this.authorizationHeader = security.name;
            }
        }
        else {
            console.error("HttpClient cannot set security scheme '" + security.scheme + "'");
            console.dir(metadata);
            return false;
        }
        if (security.proxy) {
            if (this.proxyOptions !== null) {
                console.info("HttpClient overriding client-side proxy with security proxy '" + security.proxy);
            }
            this.proxyOptions = this.uriToOptions(security.proxy);
        }
        console.log("HttpClient using security scheme '" + security.scheme + "'");
        return true;
    };
    HttpClient.prototype.uriToOptions = function (uri) {
        var requestUri = url.parse(uri);
        var options = {};
        options.agent = this.agent;
        if (this.proxyOptions != null) {
            options.hostname = this.proxyOptions.hostname;
            options.port = this.proxyOptions.port;
            options.path = uri;
            options.headers = {};
            for (var hf in this.proxyOptions.headers)
                options.headers[hf] = this.proxyOptions.headers[hf];
            options.headers["Host"] = requestUri.hostname;
        }
        else {
            options.hostname = requestUri.hostname;
            if (options.hostname === "localhost") {
                console.warn("LOCALHOST FIX");
                options.hostname = "127.0.0.1";
            }
            options.port = parseInt(requestUri.port, 10);
            options.path = requestUri.path;
            options.headers = {};
        }
        if (this.authorization !== null) {
            options.headers[this.authorizationHeader] = this.authorization;
        }
        if (this.allowSelfSigned === true) {
            options.rejectUnauthorized = false;
        }
        return options;
    };
    HttpClient.prototype.generateRequest = function (form, dflt) {
        var options = this.uriToOptions(form.href);
        options.method = dflt;
        if (typeof form["http:methodName"] === "string") {
            console.log("HttpClient got Form 'methodName'", form["http:methodName"]);
            switch (form["http:methodName"]) {
                case "GET":
                    options.method = "GET";
                    break;
                case "POST":
                    options.method = "POST";
                    break;
                case "PUT":
                    options.method = "PUT";
                    break;
                case "DELETE":
                    options.method = "DELETE";
                    break;
                case "PATCH":
                    options.method = "PATCH";
                    break;
                default: console.warn("HttpClient got invalid 'methodName', using default", options.method);
            }
        }
        var req = this.provider.request(options);
        if (options.method === "GET" && typeof form.contentType === "string") {
            console.log("HttpClient got Form 'contentType'", form.contentType);
        }
        if (Array.isArray(form["http:headers"])) {
            console.debug("HttpClient got Form 'headers'", form["http:headers"]);
            var headers = form["http:headers"];
            for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                var option = headers_1[_i];
                req.setHeader(option["http:fieldName"], option["http:fieldValue"]);
            }
        }
        else if (typeof form["http:headers"] === "object") {
            console.warn("HttpClient got Form SINGLE-ENTRY 'headers'", form["http:headers"]);
            var option = form["http:headers"];
            req.setHeader(option["http:fieldName"], option["http:fieldValue"]);
        }
        return req;
    };
    HttpClient.prototype.checkResponse = function (statusCode, contentType, body, resolve, reject) {
        if (statusCode < 200) {
            throw new Error("HttpClient received " + statusCode + " and cannot continue (not implemented, open GitHub Issue)");
        }
        else if (statusCode < 300) {
            resolve({ type: contentType, body: body });
        }
        else if (statusCode < 400) {
            throw new Error("HttpClient received " + statusCode + " and cannot continue (not implemented, open GitHub Issue)");
        }
        else if (statusCode < 500) {
            reject(new Error("Client error: " + body.toString()));
        }
        else {
            reject(new Error("Server error: " + body.toString()));
        }
    };
    return HttpClient;
}());
exports.default = HttpClient;
//# sourceMappingURL=http-client.js.map