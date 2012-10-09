/*global Loader, lumbarLoadedModules, lumbarLoadedResources */
setTimeout(function(){
  QUnit.module("Local Storage Loader Error Handling", {
    teardown: function() {
      window.foo = undefined;
      lumbarLoadedModules = {};
      lumbarLoadedResources = {};
    }
  });

  asyncTest('subsequent requests are ignored after success', function() {
    expect(5);

    var self = this;
    Loader.loader.loadModule('module-subsequent', function(err) {
      equal(err, undefined);
      equal(window.foo, 1);

      Loader.loader.loadModule('module-subsequent', function(err) {
        equal(err, undefined);
        equal(window.foo, 1);

        start();
        setTimeout.clock.tick(100);   // Actually trigger start
      });
    });
    equal(window.foo, undefined);

    // Fires off the loader
    setTimeout.clock.tick(10);
  });

  asyncTest('concurrent requests do no cause duplicates', function() {
    expect(5);
    stop(2);

    var self = this;
    Loader.loader.loadModule('module-concurrent', function(err) {
      equal(err, undefined);
      equal(window.foo, 1);

      start();
      setTimeout.clock.tick(100);   // Actually trigger start
    });
    Loader.loader.loadModule('module-concurrent', function(err) {
      equal(err, undefined);
      equal(window.foo, 1);

      start();
      setTimeout.clock.tick(100);   // Actually trigger start
    });
    equal(window.foo, undefined);

    // Fires off the loader
    start();
    setTimeout.clock.tick(100);
  });
}, 100);
