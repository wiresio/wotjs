"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findProtocol(td) {
    var base = td.base;
    var columnLoc = base.indexOf(":");
    return base.substring(0, columnLoc);
}
exports.findProtocol = findProtocol;
function findPort(td) {
    var base = td.base;
    var columnLoc = base.indexOf(':', 6);
    var divLoc = base.indexOf('/', columnLoc);
    var returnString = base.substring(columnLoc + 1, divLoc);
    return parseInt(returnString);
}
exports.findPort = findPort;
//# sourceMappingURL=td-helpers.js.map