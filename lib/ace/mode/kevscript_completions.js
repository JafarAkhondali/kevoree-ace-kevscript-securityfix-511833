define(function(require, exports, module) {
  "use strict";

  function KevScriptCompletions() {}

  KevScriptCompletions.prototype = {
    defineCompletions: function () {},

    getCompletions: function (state, session, pos, prefix, callback) {
      if (session.$worker) {
        var token = session.getTokenAt(pos.row, pos.column);
        session.$worker.call('getCompletions', [token, pos, prefix], function (suggestions) {
          callback(null, suggestions);
        });
      }
    }
  };

  exports.KevScriptCompletions = KevScriptCompletions;
});
