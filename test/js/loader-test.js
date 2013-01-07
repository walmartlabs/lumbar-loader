/*global Backbone, Loader, LoaderTest, lumbarLoadedModules, lumbarLoadedResources, lumbarLoader, module */
//window.LocalCache && LocalCache.reset();

function getSelector(sheetNum, ruleNum) {
  var sheet = document.styleSheets[sheetNum] || {},
      rules = sheet.cssRules || sheet.rules || {},
      rule = rules[ruleNum] || {};
  return rule.selectorText;
}

QUnit.module("Base Loader");
QUnit.asyncTest('load base', function() {
  QUnit.expect(6);

  // We don't support fake clocks in these tests
  setInterval.clock.restore();

  QUnit.equal(undefined, window.LoaderTest, 'Core application module is not loaded');
  Loader.loader.loadModule('base', function(err) {
    QUnit.notEqual(window.LoaderTest, undefined, 'Core application module is loaded');
    QUnit.equal(document.styleSheets.length, 2, 'Core application stylesheet is loaded');
    QUnit.equal(getSelector(1, 0), '.base', 'stylesheet is QUnit.expected');
    QUnit.equal(err, undefined);

    LoaderTest.init(module.exports);

    QUnit.start();
  });
  QUnit.equal(undefined, window.LoaderTest, 'Core application module is not loaded');
});

lumbarLoader.loadComplete = function(name) {
  if (name !== 'base') {
    return;
  }
  QUnit.module("Route Loader", {
    setup: function() {
      // We don't support fake clocks in these tests
      setInterval.clock.restore();
    },
    teardown: function() {
      lumbarLoadedModules = {};
      lumbarLoadedResources = {};
      window.failedModules = [];

      Backbone.history.unbind('route');
      Loader.loader.unbind();
      LoaderTest.unbind('load');
    }
  });
  QUnit.asyncTest('load module1', function() {
    QUnit.expect(10);
    QUnit.stop(2);    // Add additional stops for the two QUnit.expected load events

    QUnit.notEqual(window.LoaderTest, undefined, 'Core application module is loaded');
    QUnit.equal(window.LoaderTest.module1, undefined, 'module is not loaded');

    Loader.loader.bind('load:start', function(moduleName, background, object) {
      QUnit.equal(moduleName, 'module1', 'Load start occurred');
      QUnit.equal(object, Loader.loader);
      QUnit.start();
    });
    Loader.loader.bind('load:end', function(object) {
      QUnit.equal(object, Loader.loader, 'Load end occurred');
      QUnit.start();
    });

    LoaderTest.bind('load', function(fragment) {
      QUnit.equal('module1', fragment, 'Fragment is correct module');

      QUnit.notEqual(window.LoaderTest.module1, undefined, 'module is loaded');
      QUnit.equal(document.styleSheets.length, 3, 'stylesheet is loaded');
      QUnit.equal(getSelector(2, 0), '.module1', 'stylesheet is QUnit.expected');
      QUnit.deepEqual(window.failedModules, []);

      Backbone.history.navigate('');
      QUnit.start();
    });
    Backbone.history.navigate('module1', true);
  });
  QUnit.asyncTest('load moduleNoRoute', function() {
    QUnit.expect(9);
    QUnit.stop(2);    // Add additional stops for the two QUnit.expected load events

    QUnit.notEqual(window.LoaderTest, undefined, 'Core application module is loaded');
    QUnit.equal(window.LoaderTest.moduleNoRoute, undefined, 'module is not loaded');

    Loader.loader.bind('load:start', function(moduleName, background, object) {
      QUnit.equal(moduleName, 'moduleNoRoute', 'Load start occurred');
      QUnit.equal(object, Loader.loader);
      QUnit.start();
    });
    Loader.loader.bind('load:end', function(object) {
      QUnit.equal(object, Loader.loader, 'Load end occurred');
      QUnit.start();
    });

    var runCount = 0;
    Backbone.history.bind('route', function(fragment) {
      runCount || setTimeout(function() {
        QUnit.equal(runCount, 2, 'route event occurs only twice');

        QUnit.equal('moduleNoRoute', fragment, 'Fragment is correct module');
        QUnit.notEqual(window.LoaderTest.moduleNoRoute, undefined, 'module is loaded');

        QUnit.deepEqual(window.failedModules, [
          {type: 'missing-route', module: 'moduleNoRoute'}
        ]);

        Backbone.history.unbind('route');
        Backbone.history.navigate('');
        QUnit.start();
      }, 500);
      runCount++;
    });
    Backbone.history.navigate('moduleNoRoute', true);
  });


  QUnit.asyncTest('module dependancies', 5, function() {
    QUnit.equal(window.dependsLoaded, undefined, 'The dependant module code has not yet run');
    LoaderTest.bind('load', function(fragment) {
      QUnit.equal(fragment, 'has-depends', 'Verify the has-depends load');
      QUnit.equal(window.dependsLoaded, true, 'The dependant module code has run');
      QUnit.equal(true, !!LoaderTest['module-depends'], 'The dependant module exists in LoaderTest');
      Backbone.history.navigate('');
      QUnit.start();
    });

    Backbone.history.navigate('has-depends', true);
  });


  document.getElementById('lumbar-modules-loaded').innerHTML = 'modules loaded';
};
