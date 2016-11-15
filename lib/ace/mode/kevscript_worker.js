/* globals TinyConf, KevoreeKevscript, importScripts, self */
define(function(require, exports, module) {
  var oop = require("../lib/oop");
  var Mirror = require("../worker/mirror").Mirror;

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

  var logger = {
    info: console.log,
    debug: console.info,
    warn: console.warn,
    error: console.err,
    setLevel: function() {},
    setFilter: function() {}
  };

  function KevScriptWorker(sender) {
    Mirror.call(this, sender);

    // one does not simply monkey-patch
    var defineBkp = define;
    var exportsBkp = exports;
    var moduleBkp = module;
    define = null;
    exports = null;
    module = null;

    importScripts(
      'https://unpkg.com/tiny-conf@latest/dist/tiny-conf.js',
      'https://unpkg.com/kevoree-library@next/browser/kevoree-library.js',
      'https://unpkg.com/kevoree-validator@latest/browser/kevoree-validator.js',
      'https://unpkg.com/kevoree-registry-api@latest/browser/kevoree-registry-api.js',
      'https://unpkg.com/kevoree-kevscript@next/browser/kevoree-kevscript.js'
    );

    // oh yeah you love that right
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
  }

  oop.inherits(KevScriptWorker, Mirror);

  (function() {
    this.onUpdate = function() {
      var script = this.doc.getValue();
      if (!script) {
        this.sender.emit('lint', []);
      } else {
        this.kevs.parse(script, function(err, model, warnings) {
          try {
            var errors = [];
            if (err && err.nt) {
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
                row: pos.row,
                column: pos.column,
                text: err.message,
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
            this.sender.emit('lint', errors);
          } catch (err) {
            console.log('ERROR', err);
          }
        }.bind(this));
      }
    };
  }).call(KevScriptWorker.prototype);

  exports.KevScriptWorker = KevScriptWorker;
});
