"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("../common/path");
var FileClient = (function () {
    function FileClient() {
        this.setSecurity = function (metadata) { return false; };
    }
    FileClient.prototype.toString = function () {
        return "[FileClient]";
    };
    FileClient.prototype.readResource = function (form) {
        return new Promise(function (resolve, reject) {
            var filepath = form.href.split('//');
            var resource = fs.readFileSync(filepath[1], 'utf8');
            var extension = path.extname(filepath[1]);
            console.info("FileClient found '" + extension + "' extension");
            var contentType = "application/octet-stream";
            switch (extension) {
                case ".txt":
                case ".log":
                case ".ini":
                case ".cfg":
                    contentType = "text/plain";
                    break;
                case ".json":
                    contentType = "application/json";
                    break;
                case ".jsonld":
                    contentType = "application/ld+json";
                    break;
                default:
                    console.warn("FileClient cannot determine media type of '" + form.href + "'");
            }
            resolve({ type: contentType, body: Buffer.from(resource) });
        });
    };
    FileClient.prototype.writeResource = function (form, content) {
        return new Promise(function (resolve, reject) {
            reject(new Error("FileClient does not implement write"));
        });
    };
    FileClient.prototype.invokeResource = function (form, payload) {
        return new Promise(function (resolve, reject) {
            reject(new Error("FileClient does not implement invoke"));
        });
    };
    FileClient.prototype.unlinkResource = function (form) {
        return new Promise(function (resolve, reject) {
            reject(new Error("FileClient does not implement unlink"));
        });
    };
    FileClient.prototype.subscribeResource = function (form, next, error, complete) {
        error(new Error("FileClient does not implement subscribe"));
        return null;
    };
    FileClient.prototype.start = function () {
        return true;
    };
    FileClient.prototype.stop = function () {
        return true;
    };
    return FileClient;
}());
exports.default = FileClient;
//# sourceMappingURL=file-client.js.map