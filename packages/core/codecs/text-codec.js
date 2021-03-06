"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextCodec = (function () {
    function TextCodec() {
    }
    TextCodec.prototype.getMediaType = function () {
        return 'text/plain';
    };
    TextCodec.prototype.bytesToValue = function (bytes, schema, parameters) {
        var parsed;
        parsed = bytes.toString(parameters.charset);
        return parsed;
    };
    TextCodec.prototype.valueToBytes = function (value, schema, parameters) {
        var body = "";
        if (value !== undefined) {
            body = value;
        }
        return Buffer.from(body, parameters.charset);
    };
    return TextCodec;
}());
exports.default = TextCodec;
//# sourceMappingURL=text-codec.js.map