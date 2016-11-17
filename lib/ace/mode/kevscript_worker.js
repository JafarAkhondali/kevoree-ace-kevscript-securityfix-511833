/* globals TinyConf, KevoreeKevscript, importScripts, self */
define(function(require, exports, module) {
  var oop = require('../lib/oop');
  var Mirror = require('../worker/mirror').Mirror;

  var TOKENS = [
    'repoToken',
    'includeToken',
    'addToken',
    'removeToken',
    'moveToken',
    'setToken',
    'attachToken',
    'detachToken',
    'networkToken',
    'bindToken',
    'unbindToken',
    'namespaceToken',
    'startToken',
    'stopToken',
    'pauseToken',
    'comment'
  ];

  var noop = function () {};

  var logger = {
    info: noop,
    debug: noop,
    warn: noop,
    error: noop,
    setLevel: function() {},
    setFilter: function() {}
  };

  function KevScriptWorker(sender) {
    Mirror.call(this, sender);
    this.delayedCompletions = [];

    sender.on('init', function (results) {
      var defineBkp = define;
      var exportsBkp = exports;
      var moduleBkp = module;
      define = null;
      exports = null;
      module = null;

      importScripts.apply(self, results.data);
      define = defineBkp;
      exports = exportsBkp;
      module = moduleBkp;

      TinyConf.set('registry', {
        host: 'kevoree.braindead.fr',
        port: 443,
        ssl: true,
        oauth: {
          client_id: 'kevoree_registryapp',
          client_secret: 'kevoree_registryapp_secret'
        }
      });
      this.kevs = new KevoreeKevscript(logger);
    }.bind(this));
  }

  oop.inherits(KevScriptWorker, Mirror);

  (function() {
    this.onUpdate = function () {
      if (this.kevs) {
        var script = this.doc.getValue();
        if (!script) {
          this.sender.emit('lint', []);
        } else {
          this.kevs.parse(script, function(err, model, warnings) {
            var errors = [];
            if (err) {
              if (err.nt) {
                var message = 'Unable to match \'' + err.nt + '\'';
                if (err.nt === 'ws') {
                  message = 'Unable to match \'whitespace\'';
                } else if (err.nt === 'kevScript') {
                  message = 'A line must start with a statement (add, attach, set, etc.)';
                } else if (TOKENS.indexOf(err.nt) >= 0) {
                  message = 'Expected statement or comment (do you mean \'' + err.nt.split('Token').shift() + '\'?)';
                }
                var pos = this.doc.indexToPosition(err.pos[0], 0);
                errors.push({
                  row: err.line - 1,
                  column: err.col,
                  text: message,
                  type: 'error'
                });
              } else {
                if (err && err.pos) {
                  var pos = this.doc.indexToPosition(err.pos[0], 0);
                  errors.push({
                    row: pos.row,
                    column: pos.column,
                    text: err.message,
                    type: 'error'
                  });
                }
              }
            }
            // if (this.delayedCompletions.length) {
            //   var ids = this.delayedCompletions.map(function (x) { return x.callbackIds; });
            //   var c = this.delayedCompletions[this.delayedCompletions.length - 1];
            //   this.doCompletion(c.token, c.pos, c.prefix, ids);
            // }
            this.sender.emit('lint', errors);
          }.bind(this));
        }
      }
    };

    this.getCompletions = function (token, pos, prefix, callbackId) {
      if (this.isPending()) {
        this.delayedCompletions.push({
          token: token,
          pos: pos,
          prefix: prefix,
          callbackId: callbackId
        });
      } else {
        this.doCompletion(token, pos, prefix, [callbackId]);
      }
    };

    this.doCompletion = function (token, pos, prefix, callbackIds) {
      var sender = this.sender;
      callbackIds.forEach(function (id) {
        sender.callback([/*TODO*/], id);
      });
    };
  }).call(KevScriptWorker.prototype);

  exports.KevScriptWorker = KevScriptWorker;
});
