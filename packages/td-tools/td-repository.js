"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TDRepository = (function () {
    function TDRepository(tdRepoURI) {
        this.tdRepoURI = tdRepoURI;
    }
    TDRepository.prototype.addNewTD = function (td, tdLifetime) {
        return '';
    };
    TDRepository.prototype.deleteTD = function (idTdToken) {
        return true;
    };
    TDRepository.prototype.checkIfTDisInRepo = function (td) {
        return '';
    };
    TDRepository.prototype.freeTextSearch = function (query) {
        return [];
    };
    TDRepository.prototype.tripleSearch = function (query) {
        return [];
    };
    return TDRepository;
}());
exports.default = TDRepository;
//# sourceMappingURL=td-repository.js.map