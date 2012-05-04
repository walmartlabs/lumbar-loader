/*global sinon, QUnit, test*/
sinon.assert.fail = function (msg) {
    QUnit.ok(false, msg);
};

sinon.assert.pass = function (assertion) {
    QUnit.ok(true, assertion);
};

sinon.config = {
  injectIntoThis: true,
  injectInto: null,
  properties: ['spy', 'stub', 'mock', 'sandbox', 'clock'],
  useFakeTimers: [ 10 ],
  useFakeServer: false
};

(function (global) {
  var module = QUnit.module;

  QUnit.module = function(moduleName, env) {
    var sandbox;

    module.call(this, moduleName, {
      setup: function() {
        var config = sinon.getConfig(sinon.config);
        config.injectInto = this;
        sandbox = sinon.sandbox.create(config);

        env && env.setup && env.setup.call(this);
      },
      teardown: function() {
        env && env.teardown && env.teardown.call(this);
        sandbox.verifyAndRestore();

        LocalCache.reset(true);
      }
    });
  };

  // Make sure that we are seeded
  QUnit.module('', {});
}(this));

// Expose qunit in the global namespace
// Note that we are not exporting module as that causes many of our libs to blow up
this.QUnit = QUnit;
this.sinon = sinon;
[
  // Setup
  'test', 'asyncTest', 'expect', /* 'module', */

  // Asserts
  'ok', 'equal', 'notEqual', 'deepEqual', 'strictEqual', 'notStrictEqual', 'raises',

  // Async
  'start', 'stop'
].forEach(function(name) {
  this[name] = QUnit[name];
}, this);

