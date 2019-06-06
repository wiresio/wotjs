"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TD = require("../td-tools/td-tools");
var helpers_1 = require("./helpers");
var content_serdes_1 = require("./content-serdes");
var ConsumedThing = (function (_super) {
    __extends(ConsumedThing, _super);
    function ConsumedThing(servient) {
        var _this = _super.call(this) || this;
        _this.getServient = function () { return servient; };
        _this.getClients = (new (function () {
            function class_1() {
                var _this = this;
                this.clients = {};
                this.getMap = function () { return _this.clients; };
            }
            return class_1;
        }())).getMap;
        return _this;
    }
    ConsumedThing.prototype.extendInteractions = function () {
        for (var propertyName in this.properties) {
            var newProp = helpers_1.default.extend(this.properties[propertyName], new ConsumedThingProperty(propertyName, this));
            this.properties[propertyName] = newProp;
        }
        for (var actionName in this.actions) {
            var newAction = helpers_1.default.extend(this.actions[actionName], new ConsumedThingAction(actionName, this));
            this.actions[actionName] = newAction;
        }
        for (var eventName in this.events) {
            var newEvent = helpers_1.default.extend(this.events[eventName], new ConsumedThingEvent(eventName, this));
            this.events[eventName] = newEvent;
        }
    };
    ConsumedThing.prototype.getClientFor = function (forms, op) {
        var _this = this;
        if (forms.length === 0) {
            throw new Error("ConsumedThing '" + this.name + "' has no links for this interaction");
        }
        var schemes = forms.map(function (link) { return helpers_1.default.extractScheme(link.href); });
        var cacheIdx = -1;   //TODO var cacheIdx = schemes.findIndex(function (scheme) { return _this.getClients().has(scheme); });
        if (cacheIdx !== -1) {
            console.debug("ConsumedThing '" + this.name + "' chose cached client for '" + schemes[cacheIdx] + "'");
            var client = this.getClients().get(schemes[cacheIdx]);
            var form = forms[cacheIdx];
            for (var _i = 0, forms_1 = forms; _i < forms_1.length; _i++) {
                var f = forms_1[_i];
                if (f.op != undefined)
                    if (f.op.indexOf(op) != -1 && f.href.indexOf(schemes[cacheIdx] + ":") != -1) {
                        form = f;
                        break;
                    }
            }
            if (form == null) {
                form = forms[cacheIdx];
            }
            return { client: client, form: form };
        }
        else {
            console.log("ConsumedThing '" + this.name + "' has no client in cache (" + cacheIdx + ")");
            var srvIdx = 0;     //TODO var srvIdx = schemes.findIndex(function (scheme) { return _this.getServient().hasClientFor(scheme); });
            if (srvIdx === -1)
                throw new Error("ConsumedThing '" + this.name + "' missing ClientFactory for '" + schemes + "'");
            var client = this.getServient().getClientFor(schemes[srvIdx]);
            console.log("ConsumedThing '" + this.name + "' got new client for '" + schemes[srvIdx] + "'");
            if (this.security && this.securityDefinitions && Array.isArray(this.security) && this.security.length > 0) {
                console.log("ConsumedThing '" + this.name + "' setting credentials for " + client);
                var scs = void 0;
                for (var _a = 0, _b = this.security; _a < _b.length; _a++) {
                    var s = _b[_a];
                    var ws = this.securityDefinitions[s + ""];
                    if (ws && ws.scheme !== "nosec") {
                        scs.push(ws);
                    }
                }
                client.setSecurity(scs, this.getServient().getCredentials(this.id));
            }
            //TODO this.getClients().clients[schemes[srvIdx]] = client;
            var form = null;
            for (var _c = 0, forms_2 = forms; _c < forms_2.length; _c++) {
                var f = forms_2[_c];
                if (f.op != undefined)
                    if (f.op.indexOf(op) != -1 && f.href.indexOf(schemes[srvIdx] + ":") != -1) {
                        form = f;
                        break;
                    }
            }
            if (form == null) {
                form = forms[srvIdx];
            }
            return { client: client, form: form };
        }
    };
    return ConsumedThing;
}(TD.Thing));
exports.default = ConsumedThing;
var ConsumedThingProperty = (function (_super) {
    __extends(ConsumedThingProperty, _super);
    function ConsumedThingProperty(name, thing) {
        var _this = _super.call(this) || this;
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        return _this;
    }
    ConsumedThingProperty.prototype.read = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this.getThing().getClientFor(_this.forms, "readproperty"), client = _a.client, form = _a.form;
            if (!client) {
                reject(new Error("ConsumedThing '" + _this.getThing().name + "' did not get suitable client for " + form.href));
            }
            else {
                console.log("ConsumedThing '" + _this.getThing().name + "' reading " + form.href);
                client.readResource(form).then(function (content) {
                    if (!content.type)
                        content.type = form.contentType;
                    try {
                        var value = content_serdes_1.default.contentToValue(content, _this);
                        resolve(value);
                    }
                    catch (_a) {
                        reject(new Error("Received invalid content from Thing"));
                    }
                })
                    .catch(function (err) { reject(err); });
            }
        });
    };
    ConsumedThingProperty.prototype.write = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this.getThing().getClientFor(_this.forms, "writeproperty"), client = _a.client, form = _a.form;
            if (!client) {
                reject(new Error("ConsumedThing '" + _this.getThing().name + "' did not get suitable client for " + form.href));
            }
            else {
                console.log("ConsumedThing '" + _this.getThing().name + "' writing " + form.href + " with '" + value + "'");
                var content = content_serdes_1.default.valueToContent(value, _this, form.contentType);
                client.writeResource(form, content).then(function () {
                    resolve();
                })
                    .catch(function (err) { reject(err); });
            }
        });
    };
    ConsumedThingProperty.prototype.subscribe = function (next, error, complete) {
        var _this = this;
        var _a = this.getThing().getClientFor(this.forms, "observeproperty"), client = _a.client, form = _a.form;
        if (!client) {
            error(new Error("ConsumedThing '" + this.getThing().name + "' did not get suitable client for " + form.href));
        }
        else {
            console.log("ConsumedThing '" + this.getThing().name + "' subscribing to " + form.href);
            return client.subscribeResource(form, function (content) {
                if (!content.type)
                    content.type = form.contentType;
                try {
                    var value = content_serdes_1.default.contentToValue(content, _this);
                    next(value);
                }
                catch (_a) {
                    error(new Error("Received invalid content from Thing"));
                }
            }, function (err) {
                error(err);
            }, function () {
                complete();
            });
        }
    };
    return ConsumedThingProperty;
}(TD.ThingProperty));
var ConsumedThingAction = (function (_super) {
    __extends(ConsumedThingAction, _super);
    function ConsumedThingAction(name, thing) {
        var _this = _super.call(this) || this;
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        return _this;
    }
    ConsumedThingAction.prototype.invoke = function (parameter) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this.getThing().getClientFor(_this.forms, "invokeaction"), client = _a.client, form = _a.form;
            if (!client) {
                reject(new Error("ConsumedThing '" + _this.getThing().name + "' did not get suitable client for " + form.href));
            }
            else {
                console.log("ConsumedThing '" + _this.getThing().name + "' invoking " + form.href + (parameter !== undefined ? " with '" + parameter + "'" : ""));
                var input = void 0;
                if (parameter !== undefined) {
                    input = content_serdes_1.default.valueToContent(parameter, _this, form.contentType);
                }
                client.invokeResource(form, input).then(function (content) {
                    if (!content.type)
                        content.type = form.contentType;
                    if (form.response) {
                        if (content.type !== form.response.contentType) {
                            reject(new Error("Unexpected type in response"));
                        }
                    }
                    try {
                        var value = content_serdes_1.default.contentToValue(content, _this.output);
                        resolve(value);
                    }
                    catch (_a) {
                        reject(new Error("Received invalid content from Thing"));
                    }
                })
                    .catch(function (err) { reject(err); });
            }
        });
    };
    return ConsumedThingAction;
}(TD.ThingAction));
var ConsumedThingEvent = (function (_super) {
    __extends(ConsumedThingEvent, _super);
    function ConsumedThingEvent(name, thing) {
        var _this = _super.call(this) || this;
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        return _this;
    }
    ConsumedThingEvent.prototype.subscribe = function (next, error, complete) {
        var _this = this;
        var _a = this.getThing().getClientFor(this.forms, "subscribeevent"), client = _a.client, form = _a.form;
        if (!client) {
            error(new Error("ConsumedThing '" + this.getThing().name + "' did not get suitable client for " + form.href));
        }
        else {
            console.log("ConsumedThing '" + this.getThing().name + "' subscribing to " + form.href);
            return client.subscribeResource(form, function (content) {
                if (!content.type)
                    content.type = form.contentType;
                try {
                    var value = content_serdes_1.default.contentToValue(content, _this);
                    next(value);
                }
                catch (_a) {
                    error(new Error("Received invalid content from Thing"));
                }
            }, function (err) {
                error(err);
            }, function () {
                complete();
            });
        }
    };
    return ConsumedThingEvent;
}(TD.ThingEvent));
//# sourceMappingURL=consumed-thing.js.map