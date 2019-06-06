"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_codec_1 = require("./codecs/json-codec");
var text_codec_1 = require("./codecs/text-codec");
var octetstream_codec_1 = require("./codecs/octetstream-codec");
var ContentSerdes = (function () {
    function ContentSerdes() {
        this.codecs = {};
        this.offered = [];
        this.offeredctr = 0;
    }
    ContentSerdes.get = function () {
        if (!this.instance) {
            this.instance = new ContentSerdes();
            this.instance.addCodec(new json_codec_1.default(), true);
            this.instance.addCodec(new json_codec_1.default("application/senml+json"));
            this.instance.addCodec(new text_codec_1.default());
            this.instance.addCodec(new octetstream_codec_1.default());
        }
        return this.instance;
    };
    ContentSerdes.getMediaType = function (contentType) {
        var parts = contentType.split(";");
        return parts[0].trim();
    };
    ContentSerdes.getMediaTypeParameters = function (contentType) {
        var parts = contentType.split(";").slice(1);
        var params = {};
        parts.forEach(function (p) {
            var eq = p.indexOf("=");
            if (eq >= 0) {
                params[p.substr(0, eq).trim()] = p.substr(eq + 1).trim();
            }
            else {
                params[p.trim()] = null;
            }
        });
        return params;
    };
    ContentSerdes.prototype.addCodec = function (codec, offered) {
        if (offered === void 0) { offered = false; }
        ContentSerdes.get().codecs[codec.getMediaType()] = codec;
        if (offered)
            ContentSerdes.get().offered[ContentSerdes.get().offeredctr] = codec.getMediaType();
    };
    ContentSerdes.prototype.getSupportedMediaTypes = function () {
        var supportedMediaTypes = [];
        var ii = 0;
        for (SupportedMediaType in ContentSerdes.get().codecs) {
            SupportedMediaTypes[ii++] = SupportedMediaType;
        }        
        return SupportedMediaTypes;
    };
    ContentSerdes.prototype.getOfferedMediaTypes = function () {
        return ContentSerdes.get().offered;
    };
    ContentSerdes.prototype.contentToValue = function (content, schema) {
        if (content.type === undefined) {
            if (content.body.byteLength > 0) {
                content.type = ContentSerdes.DEFAULT;
            }
            else {
                return;
            }
        }
        var mt = ContentSerdes.getMediaType(content.type);
        var par = ContentSerdes.getMediaTypeParameters(content.type);
        if (mt in this.codecs) {
            console.info("ContentSerdes deserializing from " + content.type);
            var codec = this.codecs[mt];
            var res = codec.bytesToValue(content.body, schema, par);
            return res;
        }
        else {
            console.info("ContentSerdes passthrough due to unsupported media type '" + mt + "'");
            return content.body.toString();
        }
    };
    ContentSerdes.prototype.valueToContent = function (value, schema, contentType) {
        if (contentType === void 0) { contentType = ContentSerdes.DEFAULT; }
        if (value === undefined)
            console.warn("ContentSerdes valueToContent got no value");
        var bytes = null;
        var mt = ContentSerdes.getMediaType(contentType);
        var par = ContentSerdes.getMediaTypeParameters(contentType);
        if (mt in this.codecs) {
            console.debug("ContentSerdes serializing to " + contentType);
            var codec = this.codecs[mt];
            bytes = codec.valueToBytes(value, schema, par);
        }
        else {
            console.warn("ContentSerdes passthrough due to unsupported serialization format '" + contentType + "'");
            bytes = Buffer.from(value);
        }
        return { type: contentType, body: bytes };
    };
    ContentSerdes.DEFAULT = "application/json";
    ContentSerdes.TD = "application/td+json";
    ContentSerdes.JSON_LD = "application/ld+json";
    return ContentSerdes;
}());
exports.ContentSerdes = ContentSerdes;
exports.default = ContentSerdes.get();
//# sourceMappingURL=content-serdes.js.map