//window.LocalCache && LocalCache.reset();

function getSelector(sheetNum, ruleNum) {
  var sheet = document.styleSheets[sheetNum] || {},
      rules = sheet.cssRules || sheet.rules || {},
      rule = rules[ruleNum] || {};
  return rule.selectorText;
}

window.module("Base Loader");
asyncTest('load base', function() {
  expect(6);

  equal(undefined, window.LoaderTest, 'Core application module is not loaded');
  Loader.loader.loadModule('base', function(err) {
    notEqual(window.LoaderTest, undefined, 'Core application module is loaded');
    equal(document.styleSheets.length, 2, 'Core application stylesheet is loaded');
    equal(getSelector(1, 0), '.base', 'stylesheet is expected');
    equal(err, undefined);

    LoaderTest.init(module.exports);

    start();
  });
  equal(undefined, window.LoaderTest, 'Core application module is not loaded');
});

lumbarLoader.loadComplete = function(name) {
  if (name !== 'base') {
    return;
  }
  window.module("Route Loader", {
    teardown: function() {
      lumbarLoadedModules = {};
      lumbarLoadedResources = {};

      Backbone.history.unbind('route');
      Loader.loader.unbind();
      LoaderTest.unbind('load');
    }
  });
  asyncTest('load module1', function() {
    expect(8);
    stop(2);    // Add additional stops for the two expected load events

    notEqual(window.LoaderTest, undefined, 'Core application module is loaded');
    equal(window.LoaderTest.module1, undefined, 'module is not loaded');

    Loader.loader.bind('load:start', function(moduleName) {
      equal(moduleName, 'module1', 'Load start occurred');
      start();
    });
    Loader.loader.bind('load:end', function(moduleName) {
      equal(moduleName, 'module1', 'Load end occurred');
      start();
    });

    LoaderTest.bind('load', function(fragment) {
      equal('module1', fragment, 'Fragment is correct module');

      notEqual(window.LoaderTest.module1, undefined, 'module is loaded');
      equal(document.styleSheets.length, 3, 'stylesheet is loaded');
      equal(getSelector(2, 0), '.module1', 'stylesheet is expected');

      Backbone.history.navigate('');
      start();
    });
    Backbone.history.navigate('module1', true);
  });
  asyncTest('load moduleNoRoute', function() {
    expect(7);
    stop(2);    // Add additional stops for the two expected load events

    notEqual(window.LoaderTest, undefined, 'Core application module is loaded');
    equal(window.LoaderTest.moduleNoRoute, undefined, 'module is not loaded');

    Loader.loader.bind('load:start', function(moduleName) {
      equal(moduleName, 'moduleNoRoute', 'Load start occurred');
      start();
    });
    Loader.loader.bind('load:end', function(moduleName) {
      equal(moduleName, 'moduleNoRoute', 'Load end occurred');
      start();
    });

    var runCount = 0;
    Backbone.history.bind('route', function(fragment) {
      runCount || setTimeout(function() {
        equal(runCount, 2, 'route event occurs only twice');

        equal('moduleNoRoute', fragment, 'Fragment is correct module');
        notEqual(window.LoaderTest.moduleNoRoute, undefined, 'module is loaded');

        Backbone.history.unbind('route');
        Backbone.history.navigate('');
        start();
      }, 500);
      runCount++;
    });
    Backbone.history.navigate('moduleNoRoute', true);
  });

  document.getElementById('lumbar-modules-loaded').innerHTML = 'modules loaded';
};
