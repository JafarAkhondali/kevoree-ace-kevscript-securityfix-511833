ace.define("ace/mode/kevscript_completion",["require","exports","module"], function(require, exports, module) {
  "use strict";

  function KevScriptCompletion() {}

  (function() {
    this.getCompletions = function (state, session, pos, prefix, callback) {
        if (!session.$worker) {
          return [];
        }
        var token = session.getTokenAt(pos.row, pos.column);
        if (!token) {
          return [];
        }
        setTimeout(function () {
          session.$worker.call('getCompletions', [pos, prefix], function (result) {
            callback(null, result);
          })
        }, 0);
    };
  }).call(KevScriptCompletion.prototype);

  exports.KevScriptCompletion = KevScriptCompletion;
});
