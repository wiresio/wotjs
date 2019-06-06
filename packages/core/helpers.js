"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("../common/url");
//var os = require("os");
var Helpers = (function () {
    function Helpers() {
    }
    Helpers.extractScheme = function (uri) {
        var parsed = url.parse(uri);
        if (parsed.protocol === null) {
            throw new Error("Protocol in url \"" + uri + "\" must be valid");
        }
        var scheme = parsed.protocol.slice(0, -1);
        console.info("Helpers found scheme '" + scheme + "'");
        return scheme;
    };
    Helpers.setStaticAddress = function (address) {
        Helpers.staticAddress = address;
    };
    Helpers.getAddresses = function () {
        var addresses = [];
        if (Helpers.staticAddress !== undefined) {
            addresses.push(Helpers.staticAddress);
            console.debug("AddressHelper uses static " + addresses);
            return addresses;
        }
        else {
            /*var interfaces = os.networkInterfaces();
            for (var iface in interfaces) {
                interfaces[iface].forEach(function (entry) {
                    console.debug("AddressHelper found " + entry.address);
                    if (entry.internal === false) {
                        if (entry.family === "IPv4") {
                            addresses.push(entry.address);
                        }
                        else if (entry.scopeid === 0) {
                            addresses.push(Helpers.toUriLiteral(entry.address));
                        }
                    }
                });
            }
            if (addresses.length === 0) {
                addresses.push('localhost');
            }
            console.debug("AddressHelper identified " + addresses);
            return addresses;*/
            return;
        }
    };
    Helpers.toUriLiteral = function (address) {
        if (!address) {
            console.error("AddressHelper received invalid address '" + address + "'");
            return "{invalid address}";
        }
        if (address.indexOf(':') !== -1) {
            address = "[" + address + "]";
        }
        return address;
    };
    Helpers.generateUniqueName = function (name) {
        var suffix = name.match(/.+_([0-9]+)$/);
        if (suffix !== null) {
            return name.slice(0, -suffix[1].length) + (1 + parseInt(suffix[1]));
        }
        else {
            return name + "_2";
        }
    };
    Helpers.extend = function (first, second) {
        var result = {};
        for (var id in first) {
            result[id] = first[id];
        }
        for (var id in second) {
            if (!result.hasOwnProperty(id)) {
                result[id] = second[id];
            }
        }
        return result;
    };
    Helpers.staticAddress = undefined;
    return Helpers;
}());
exports.default = Helpers;
//# sourceMappingURL=helpers.js.map