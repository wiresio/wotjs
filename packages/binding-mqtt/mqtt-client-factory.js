"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_client_1 = require("./mqtt-client");
var MqttClientFactory = (function () {
    function MqttClientFactory() {
        this.scheme = "mqtt";
        this.getClient = function () {
            return new mqtt_client_1.default();
        };
    }
    MqttClientFactory.prototype.init = function () {
        return true;
    };
    MqttClientFactory.prototype.destroy = function () {
        return true;
    };
    return MqttClientFactory;
}());
exports.default = MqttClientFactory;
//# sourceMappingURL=mqtt-client-factory.js.map