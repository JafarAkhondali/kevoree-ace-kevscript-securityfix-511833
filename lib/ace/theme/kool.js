define(function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-kool";
exports.cssText = require("../requirejs/text!./kool.css");

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);

});
