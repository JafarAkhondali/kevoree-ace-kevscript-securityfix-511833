define(function (require, exports, module) {
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
    //
    // for (var state in this.$rules) {
    //   var stateRules = this.$rules[state];
    //   for (var i = stateRules.length; i--;) {
    //     var rule = stateRules[i];
    //     if (rule.include || typeof rule === 'string') {
    //       var args = [i, 1].concat(this.$rules[rule.include || rule]);
    //       if (rule.noEscape) {
    //         args = args.filter(function(x) {
    //           return !x.next;
    //         });
    //       }
    //       stateRules.splice.apply(stateRules, args);
    //     }
    //   }
    // }
  };

  oop.inherits(KevscriptHighlightRules, TextHighlightRules);
  exports.KevscriptHighlightRules = KevscriptHighlightRules;
});
