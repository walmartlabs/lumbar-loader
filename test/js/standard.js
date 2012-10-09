/*global Loader, lumbarLoadedModules, lumbarLoadedResources */
setTimeout(function(){
  QUnit.module("Local Storage Loader Error Handling", {
    teardown: function() {
      window.foo = undefined;
      lumbarLoadedModules = {};
      lumbarLoadedResources = {};
    }
  });

  QUnit.asyncTest('subsequent requests are ignored after success', function() {
    QUnit.expect(5);

    Loader.loader.loadModule('module-subsequent', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 1);

      Loader.loader.loadModule('module-subsequent', function(err) {
        QUnit.equal(err, undefined);
        QUnit.equal(window.foo, 1);

        QUnit.start();
        setTimeout.clock.tick(100);   // Actually trigger start
      });
    });
    QUnit.equal(window.foo, undefined);

    // Fires off the loader
    setTimeout.clock.tick(10);
  });

  QUnit.asyncTest('concurrent requests do no cause duplicates', function() {
    QUnit.expect(5);
    QUnit.stop(2);

    Loader.loader.loadModule('module-concurrent', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 1);

      QUnit.start();
      setTimeout.clock.tick(100);   // Actually trigger start
    });
    Loader.loader.loadModule('module-concurrent', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 1);

      QUnit.start();
      setTimeout.clock.tick(100);   // Actually trigger start
    });
    QUnit.equal(window.foo, undefined);

    // Fires off the loader
    QUnit.start();
    setTimeout.clock.tick(100);
  });
}, 100);
