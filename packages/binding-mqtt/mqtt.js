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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var td_tools_1 = require("../td-tools/td-tools");
var mqtt_client_1 = require("./mqtt-client");
exports.MqttClient = mqtt_client_1.default;
var mqtt_client_factory_1 = require("./mqtt-client-factory");
exports.MqttClientFactory = mqtt_client_factory_1.default;
__export(require("./mqtt-client"));
__export(require("./mqtt-client-factory"));
var MqttQoS;
(function (MqttQoS) {
    MqttQoS[MqttQoS["QoS0"] = 0] = "QoS0";
    MqttQoS[MqttQoS["QoS1"] = 1] = "QoS1";
    MqttQoS[MqttQoS["QoS2"] = 2] = "QoS2";
})(MqttQoS = exports.MqttQoS || (exports.MqttQoS = {}));
var MqttForm = (function (_super) {
    __extends(MqttForm, _super);
    function MqttForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this['mqtt:qos'] = MqttQoS.QoS0;
        return _this;
    }
    return MqttForm;
}(td_tools_1.Form));
exports.MqttForm = MqttForm;
//# sourceMappingURL=mqtt.js.map