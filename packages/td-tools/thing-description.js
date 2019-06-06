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
exports.DEFAULT_CONTEXT = "http://www.w3.org/ns/td";
exports.DEFAULT_THING_TYPE = "Thing";
var Versioning = (function () {
    function Versioning() {
    }
    return Versioning;
}());
exports.Versioning = Versioning;
var Thing = (function () {
    function Thing() {
        this["@context"] = exports.DEFAULT_CONTEXT;
        this["@type"] = exports.DEFAULT_THING_TYPE;
        this.security = [];
        this.properties = {};
        this.actions = {};
        this.events = {};
        this.links = [];
    }
    return Thing;
}());
exports.default = Thing;
var ThingInteraction = (function () {
    function ThingInteraction() {
    }
    return ThingInteraction;
}());
exports.ThingInteraction = ThingInteraction;
var ThingProperty = (function (_super) {
    __extends(ThingProperty, _super);
    function ThingProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ThingProperty;
}(ThingInteraction));
exports.ThingProperty = ThingProperty;
var ThingAction = (function (_super) {
    __extends(ThingAction, _super);
    function ThingAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ThingAction;
}(ThingInteraction));
exports.ThingAction = ThingAction;
var ThingEvent = (function (_super) {
    __extends(ThingEvent, _super);
    function ThingEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ThingEvent;
}(ThingInteraction));
exports.ThingEvent = ThingEvent;
var Security = (function () {
    function Security() {
    }
    return Security;
}());
exports.Security = Security;
var ExpectedResponse = (function () {
    function ExpectedResponse() {
    }
    return ExpectedResponse;
}());
exports.ExpectedResponse = ExpectedResponse;
var Form = (function () {
    function Form(href, contentType) {
        this.href = href;
        if (contentType)
            this.contentType = contentType;
    }
    return Form;
}());
exports.Form = Form;
//# sourceMappingURL=thing-description.js.map