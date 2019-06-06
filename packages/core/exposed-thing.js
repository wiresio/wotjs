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
//var Subject_1 = require("rxjs/Subject");
var TD = require("../td-tools/td-tools");
var helpers_1 = require("./helpers");
var ExposedThing = (function (_super) {
    __extends(ExposedThing, _super);
    function ExposedThing(servient) {
        var _this = _super.call(this) || this;
        _this.getServient = function () { return servient; };
        _this.getSubjectTD = (new (function () {
            function class_1() {
                var _this = this;
                //this.subjectTDChange = new Subject_1.Subject();
                this.getSubject = function () { return _this.subjectTDChange; };
            }
            return class_1;
        }())).getSubject;
        return _this;
    }
    ExposedThing.prototype.extendInteractions = function () {
        for (var propertyName in this.properties) {
            var newProp = helpers_1.default.extend(this.properties[propertyName], new ExposedThingProperty(propertyName, this));
            this.properties[propertyName] = newProp;
        }
        for (var actionName in this.actions) {
            var newAction = helpers_1.default.extend(this.actions[actionName], new ExposedThingAction(actionName, this));
            this.actions[actionName] = newAction;
        }
        for (var eventName in this.events) {
            var newEvent = helpers_1.default.extend(this.events[eventName], new ExposedThingEvent(eventName, this));
            this.events[eventName] = newEvent;
        }
    };
    ExposedThing.prototype.set = function (name, value) {
        console.log("ExposedThing '" + this.name + "' setting field '" + name + "' to '" + value + "'");
        this[name] = value;
    };
    ExposedThing.prototype.getThingDescription = function () {
        return TD.serializeTD(this);
    };
    ExposedThing.prototype.expose = function () {
        var _this = this;
        console.log("ExposedThing '" + this.name + "' exposing all Interactions and TD");
        return new Promise(function (resolve, reject) {
            _this.getServient().expose(_this).then(function () {
                _this.getSubjectTD().next(_this.getThingDescription());
                resolve();
            })
                .catch(function (err) { return reject(err); });
        });
    };
    ExposedThing.prototype.destroy = function () {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    };
    ExposedThing.prototype.addProperty = function (name, property, init) {
        console.log("ExposedThing '" + this.name + "' adding Property '" + name + "'");
        var newProp = helpers_1.default.extend(property, new ExposedThingProperty(name, this));
        this.properties[name] = newProp;
        if (init !== undefined) {
            newProp.write(init);
        }
        return this;
    };
    ExposedThing.prototype.addAction = function (name, action, handler) {
        if (!handler) {
            throw new Error("addAction() requires handler");
        }
        console.log("ExposedThing '" + this.name + "' adding Action '" + name + "'");
        var newAction = helpers_1.default.extend(action, new ExposedThingAction(name, this));
        newAction.getState().handler = handler.bind(newAction.getState().scope);
        this.actions[name] = newAction;
        return this;
    };
    ExposedThing.prototype.addEvent = function (name, event) {
        var newEvent = helpers_1.default.extend(event, new ExposedThingEvent(name, this));
        this.events[name] = newEvent;
        return this;
    };
    ExposedThing.prototype.removeProperty = function (propertyName) {
        if (this.properties[propertyName]) {
            delete this.properties[propertyName];
        }
        else {
            throw new Error("ExposedThing '" + this.name + "' has no Property '" + propertyName + "'");
        }
        return this;
    };
    ExposedThing.prototype.removeAction = function (actionName) {
        if (this.actions[actionName]) {
            delete this.actions[actionName];
        }
        else {
            throw new Error("ExposedThing '" + this.name + "' has no Action '" + actionName + "'");
        }
        return this;
    };
    ExposedThing.prototype.removeEvent = function (eventName) {
        if (this.events[eventName]) {
            this.events[eventName].getState().subject.complete();
            delete this.events[eventName];
        }
        else {
            throw new Error("ExposedThing '" + this.name + "' has no Event '" + eventName + "'");
        }
        return this;
    };
    ExposedThing.prototype.setPropertyReadHandler = function (propertyName, handler) {
        console.log("ExposedThing '" + this.name + "' setting read handler for '" + propertyName + "'");
        if (this.properties[propertyName]) {
            this.properties[propertyName].getState().readHandler = handler.bind(this.properties[propertyName].getState().scope);
        }
        else {
            throw new Error("ExposedThing '" + this.name + "' has no Property '" + propertyName + "'");
        }
        return this;
    };
    ExposedThing.prototype.setPropertyWriteHandler = function (propertyName, handler) {
        console.log("ExposedThing '" + this.name + "' setting write handler for '" + propertyName + "'");
        if (this.properties[propertyName]) {
            this.properties[propertyName].getState().writeHandler = handler.bind(this.properties[propertyName].getState().scope);
            if (this.properties[propertyName].readOnly) {
                console.warn("ExposedThing '" + this.name + "' automatically setting Property '" + propertyName + "' readOnly to false");
                this.properties[propertyName].readOnly = false;
            }
        }
        else {
            throw new Error("ExposedThing '" + this.name + "' has no Property '" + propertyName + "'");
        }
        return this;
    };
    ExposedThing.prototype.setActionHandler = function (actionName, handler) {
        console.log("ExposedThing '" + this.name + "' setting action Handler for '" + actionName + "'");
        if (this.actions[actionName]) {
            this.actions[actionName].getState().handler = handler.bind(this.actions[actionName].getState().scope);
        }
        else {
            throw new Error("ExposedThing '" + this.name + "' has no Action '" + actionName + "'");
        }
        return this;
    };
    return ExposedThing;
}(TD.Thing));
exports.default = ExposedThing;
var ExposedThingProperty = (function (_super) {
    __extends(ExposedThingProperty, _super);
    function ExposedThingProperty(name, thing) {
        var _this = _super.call(this) || this;
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        _this.getState = (new (function () {
            function class_2() {
                var _this = this;
                this.state = new PropertyState();
                this.getInternalState = function () { return _this.state; };
            }
            return class_2;
        }())).getInternalState;
        _this.readOnly = false;
        _this.writeOnly = false;
        _this.observable = false;
        return _this;
    }
    ExposedThingProperty.prototype.read = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.getState().readHandler != null) {
                console.log("ExposedThing '" + _this.getThing().name + "' calls registered readHandler for Property '" + _this.getName() + "'");
                _this.getState().readHandler(options).then(function (customValue) {
                    _this.getState().value = customValue;
                    resolve(customValue);
                });
            }
            else {
                console.log("ExposedThing '" + _this.getThing().name + "' gets internal value '" + _this.getState().value + "' for Property '" + _this.getName() + "'");
                resolve(_this.getState().value);
            }
        });
    };
    ExposedThingProperty.prototype.write = function (value, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.getState().writeHandler != null) {
                var promiseOrValueOrNil = _this.getState().writeHandler(value, options);
                if (promiseOrValueOrNil !== undefined) {
                    if (typeof promiseOrValueOrNil.then === "function") {
                        promiseOrValueOrNil.then(function (customValue) {
                            console.log("ExposedThing '" + _this.getThing().name + "' write handler for Property '" + _this.getName() + "' sets custom value '" + customValue + "'");
                            if (_this.getState().value !== customValue) {
                                _this.getState().subject.next(customValue);
                            }
                            _this.getState().value = customValue;
                            resolve();
                        })
                            .catch(function (customError) {
                            console.warn("ExposedThing '" + _this.getThing().name + "' write handler for Property '" + _this.getName() + "' rejected the write with error '" + customError + "'");
                            reject(customError);
                        });
                    }
                    else {
                        console.warn("ExposedThing '" + _this.getThing().name + "' write handler for Property '" + _this.getName() + "' does not return promise");
                        if (_this.getState().value !== promiseOrValueOrNil) {
                            _this.getState().subject.next(promiseOrValueOrNil);
                        }
                        _this.getState().value = promiseOrValueOrNil;
                        resolve();
                    }
                }
                else {
                    console.warn("ExposedThing '" + _this.getThing().name + "' write handler for Property '" + _this.getName() + "' does not return custom value, using direct value '" + value + "'");
                    if (_this.getState().value !== value) {
                        _this.getState().subject.next(value);
                    }
                    _this.getState().value = value;
                    resolve();
                }
            }
            else {
                console.log("ExposedThing '" + _this.getThing().name + "' directly sets Property '" + _this.getName() + "' to value '" + value + "'");
                if (_this.getState().value !== value) {
                    _this.getState().subject.next(value);
                }
                _this.getState().value = value;
                resolve();
            }
        });
    };
    ExposedThingProperty.prototype.subscribe = function (next, error, complete) {
        return this.getState().subject.asObservable().subscribe(next, error, complete);
    };
    return ExposedThingProperty;
}(TD.ThingProperty));
var ExposedThingAction = (function (_super) {
    __extends(ExposedThingAction, _super);
    function ExposedThingAction(name, thing) {
        var _this = _super.call(this) || this;
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        _this.getState = (new (function () {
            function class_3() {
                var _this = this;
                this.state = new ActionState();
                this.getInternalState = function () { return _this.state; };
            }
            return class_3;
        }())).getInternalState;
        return _this;
    }
    ExposedThingAction.prototype.invoke = function (parameter, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.debug("ExposedThing '" + _this.getThing().name + "' has Action state of '" + _this.getName() + "':", _this.getState());
            if (_this.getState().handler != null) {
                console.log("ExposedThing '" + _this.getThing().name + "' calls registered handler for Action '" + _this.getName() + "'");
                resolve(_this.getState().handler(parameter, options));
            }
            else {
                reject(new Error("ExposedThing '" + _this.getThing().name + "' has no handler for Action '" + _this.getName() + "'"));
            }
        });
    };
    return ExposedThingAction;
}(TD.ThingAction));
var ExposedThingEvent = (function (_super) {
    __extends(ExposedThingEvent, _super);
    function ExposedThingEvent(name, thing) {
        var _this = _super.call(this) || this;
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        _this.getState = (new (function () {
            function class_4() {
                var _this = this;
                this.state = new EventState();
                this.getInternalState = function () { return _this.state; };
            }
            return class_4;
        }())).getInternalState;
        return _this;
    }
    ExposedThingEvent.prototype.subscribe = function (next, error, complete) {
        return this.getState().subject.asObservable().subscribe(next, error, complete);
    };
    ExposedThingEvent.prototype.emit = function (data) {
        this.getState().subject.next(data);
    };
    return ExposedThingEvent;
}(TD.ThingEvent));
var PropertyState = (function () {
    function PropertyState(value) {
        if (value === void 0) { value = null; }
        this.value = value;
        //this.subject = new Subject_1.Subject();
        this.scope = {};
        this.writeHandler = null;
        this.readHandler = null;
    }
    return PropertyState;
}());
var ActionState = (function () {
    function ActionState() {
        this.scope = {};
        this.handler = null;
    }
    return ActionState;
}());
var EventState = (function () {
    /*function EventState() {
        this.subject = new Subject_1.Subject();
    }
    return EventState;*/
    return;
}());
//# sourceMappingURL=exposed-thing.js.map