define(function(require, exports, module) {
  "use strict";

  var oop = require("../lib/oop");

  var TextMode = require("./text").Mode;
  var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
  var WorkerClient = require("../worker/worker_client").WorkerClient;
  var KevScriptHighlightRules = require("./kevscript_highlight_rules").KevScriptHighlightRules;
  var KevScriptCompletions = require('./kevscript_completions').KevScriptCompletions;

  function KevScriptMode() {
    this.HighlightRules = KevScriptHighlightRules;
    this.completer = new KevScriptCompletions();
    this.options = {
      'tiny-conf': 'latest',
      'kevoree-library': 'next',
      'kevoree-validator': 'latest',
      'kevoree-registry-api': 'latest',
      'kevoree-kevscript': 'next'
    };
  };

  oop.inherits(KevScriptMode, TextMode);

  (function() {
    this.$id = 'ace/mode/kevscript';

    this.lineCommentStart = '//';

    this.createWorker = function(session) {
      var worker = new WorkerClient(['ace'], 'ace/mode/kevscript_worker', 'KevScriptWorker');
      worker.attachToDocument(session.getDocument());

      worker.on('lint', function (results) {
        session.setAnnotations(results.data);
      });

      worker.emit('init', {
        data: Object.keys(this.options)
          .reduce(function (array, key) {
            var path = key === 'tiny-conf' ? 'dist':'browser';
            array.push('https://unpkg.com/' + key + '@' + this.options[key] + '/' + path + '/' + key + '.js');
            return array;
          }.bind(this), [])
      });

      return worker;
    };
  }).call(KevScriptMode.prototype);

  exports.Mode = KevScriptMode;
});
