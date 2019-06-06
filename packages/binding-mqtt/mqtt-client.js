"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core/core");
var mqtt = require("mqtt");
var url = require("../common/url");
var Subscription_1 = require("../common/rx");
var MqttClient = (function () {
    function MqttClient(config, secure) {
        if (config === void 0) { config = null; }
        if (secure === void 0) { secure = false; }
        var _this = this;
        this.user = undefined;
        this.psw = undefined;
        this.pubclient = undefined;
        this.subclient = undefined;
        this.readResource = function (form) {
            return new Promise(function (resolve, reject) {
                throw new Error('Method not implemented.');
            });
        };
        this.writeResource = function (form, content) {
            return new Promise(function (resolve, reject) {
                throw new Error('Method not implemented.');
            });
        };
        this.invokeResource = function (form, content) {
            return new Promise(function (resolve, reject) {
                var requestUri = url.parse(form['href']);
                var topic = requestUri.pathname;
                var brokerUri = "mqtt://" + requestUri.host;
                if (_this.pubclient == undefined) {
                    var pubopts = {
                      clientId: 'iotjs-mqtt-pub',
                      port: requestUri.port,
                      keepalive: 30
                    };                      
                    _this.pubclient = mqtt.connect(requestUri.host, pubopts);
                    //_this.pubclient = mqtt.connect(brokerUri);
                }
                if (content == undefined) {
                    _this.pubclient.publish(topic, JSON.stringify(Buffer.from("")));
                }
                else {
                    _this.pubclient.publish(topic, content.body);
                }
                resolve({ type: core_1.ContentSerdes.DEFAULT, body: Buffer.from("") });
            });
        };
        this.unlinkResource = function (form) {
            throw new Error('Method not implemented.');
        };
        this.start = function () {
            return true;
        };
        this.stop = function () {
            return true;
        };
        this.mapQoS = function (qos) {
            switch (qos) {
                case 2:
                    return qos = 2;
                case 1:
                    return qos = 1;
                case 0:
                default:
                    return qos = 0;
            }
        };
        this.logError = function (message) {
            console.error("[MqttClient]" + message);
        };
    }
    MqttClient.prototype.subscribeResource = function (form, next, error, complete) {
        var _this = this;
        var contentType = form.contentType;
        var retain = form["mqtt:retain"];
        var qos = form["mqtt:qos"];
        var requestUri = url.parse(form['href']);
        var topic = requestUri.pathname;
        var brokerUri = "mqtt://" + requestUri.host;
        if (this.subclient == undefined) {
            var subopts = {
              clientId: 'iotjs-mqtt-sub',
              host: requestUri.host,
              port: requestUri.port,
              keepalive: 30
            };
            this.subclient = mqtt.connect(subopts);
            //this.subclient = mqtt.connect(brokerUri);
        }
        this.subclient.on('connect', function () { return _this.subclient.subscribe(topic); });
        this.subclient.on('message', function (receivedTopic, payload, packet) {
            console.log("Received MQTT message (topic, data): (" + receivedTopic + ", " + payload + ")");
            if (receivedTopic === topic) {
                next({ contentType: contentType, body: Buffer.from(payload) });
            }
        });
        this.subclient.on('error', function (error) {
            if (_this.subclient) {
                _this.subclient.end();
            }
            _this.subclient == undefined;
            error(error);
        });
        return new Subscription_1.Subscription(function () { _this.subclient.end(); });
    };
    MqttClient.prototype.setSecurity = function (metadata, credentials) {
        if (metadata === undefined || !Array.isArray(metadata) || metadata.length == 0) {
            console.warn("MqttClient received empty security metadata");
            return false;
        }
        var security = metadata[0];
        if (security.scheme === "basic") {
        }
        return true;
    };
    return MqttClient;
}());
exports.default = MqttClient;
//# sourceMappingURL=mqtt-client.js.map