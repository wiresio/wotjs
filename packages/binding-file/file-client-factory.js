"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var file_client_1 = require("./file-client");
var FileClientFactory = (function () {
    function FileClientFactory(proxy) {
        this.scheme = "file";
        this.init = function () { return true; };
        this.destroy = function () { return true; };
    }
    FileClientFactory.prototype.getClient = function () {
        console.log("FileClientFactory creating client for '" + this.scheme + "'");
        return new file_client_1.default();
    };
    return FileClientFactory;
}());
exports.default = FileClientFactory;
//# sourceMappingURL=file-client-factory.js.map