define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

define("ace/mode/kevscript_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function (require, exports, module) {
  var oop = require('../lib/oop');
  var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

  function KevscriptHighlightRules() {
    this.$rules = {
      start: [
        { regex: /\/\/.*/, token: 'comment.line.double-slash' },
        { regex: /(%)([\w]+)(%)/, token: ['ctxvarbracket.constant.character', 'ctxvar.variable.parameter', 'ctxvarbracket.constant.character'] },
        { regex: /(%%)([\w]+)(%%)/, token: ['ctxvarbracket.constant.character', 'ctxvar.variable.parameter', 'ctxvarbracket.constant.character'] },
        { regex: /,|\/|:/, token: 'delimiter' },
        { regex: /(\s*)\b(add|repo|include|remove|move|set|attach|detach|network|bind|unbind|start|stop|pause)\b/, token: [null, 'statement.entity.name.tag'], sol: true }, // eslint-disable-line
        { regex: /LATEST|RELEASE/, token: 'constant.language' },
        { regex: /[A-Z]([a-zA-Z0-9]*)?/, token: 'typedef.support.type' },
        { regex: /[a-z][\w-]*(\.[a-z][\w-]*)*\.(?=[A-Z])/, token: 'namespace.variable.parameter.meta' },
        { regex: /'/, token: 'string.quoted.single', next: 'singlequote' },
        { regex: /"/, token: 'string.quoted.double', next: 'doublequote' },
        { regex: /[a-z][\w]*\.[a-z][\w]*\.([a-z][\w]*)?/, token: 'instancepath.variable.parameter' },
        { regex: /[a-z][\w]*\.([a-z][\w]*)?/, token: 'instancepath.variable.parameter' },
        { regex: /[a-z][\w]*/, token: 'instancepath.variable.parameter' },
        { regex: /[0-9]+/, token: 'version.constant.numeric' },
        { regex: /\*/, token: 'wildcard.constant.language.meta' }
      ],
      singlequote: [
        { regex: /\\./, token: 'escaped' },
        { regex: /'/, token: 'string.quoted.single', next: 'start' },
        { regex: /[^\\']*/, token: 'string.quoted.single' }
      ],
      doublequote: [
        { regex: /\\./, token: 'escaped' },
        { regex: /"/, token: 'string.quoted.double', next: 'start' },
        { regex: /[^\\"]*/, token: 'string.quoted.double' }
      ],
      meta: {
        lineComment: '//'
      }
    };
  };

  oop.inherits(KevscriptHighlightRules, TextHighlightRules);
  exports.KevscriptHighlightRules = KevscriptHighlightRules;
});

define("ace/mode/kevscript",["require","exports","module","ace/lib/oop","ace/mode/text","ace/tokenizer","ace/mode/matching_brace_outdent","ace/worker/worker_client","ace/mode/kevscript_highlight_rules"], function(require, exports, module) {
  "use strict";

  var oop = require("../lib/oop");
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
