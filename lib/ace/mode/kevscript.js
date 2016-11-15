define(function(require, exports, module) {
  "use strict";

  var oop = require("../lib/oop");
  // defines the parent mode
  var TextMode = require("./text").Mode;
  var Tokenizer = require("../tokenizer").Tokenizer;
  var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
  var WorkerClient = require("../worker/worker_client").WorkerClient;
  var KevscriptHighlightRules = require("./kevscript_highlight_rules").KevscriptHighlightRules;

  function KevScriptMode() {
    this.HighlightRules = KevscriptHighlightRules;
  };

  oop.inherits(KevScriptMode, TextMode);

  (function() {
    this.$id = 'kevscript';
    this.lineCommentStart = '//';

    // create worker for live syntax checking
    this.createWorker = function(session) {
      var worker = new WorkerClient(['ace'], 'ace/mode/kevscript_worker', 'KevScriptWorker');
      worker.attachToDocument(session.getDocument());

      worker.on('lint', function (results) {
        session.setAnnotations(results.data);
      });

      return worker;
    };
  }).call(KevScriptMode.prototype);

  exports.Mode = KevScriptMode;
});
