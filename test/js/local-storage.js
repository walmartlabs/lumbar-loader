setTimeout(function(){
  QUnit.module("Local Storage Loader Error Handling", {
    setup: function() {
      this.stub(LocalCache, 'get');
      this.stub(LocalCache, 'store');

      this.xhr = sinon.useFakeXMLHttpRequest();
      var requests = this.requests = [];

      this.xhr.onCreate = function (xhr) {
        requests.push(xhr);
      };
    },
    teardown: function() {
      this.xhr.restore();
      window.foo = undefined;
      window.failedModules = [];
      lumbarLoadedModules = {};
      lumbarLoadedResources = {};
      Backbone.history.navigate('', true);
    }
  });

  test('cached responses are success', function() {
    QUnit.expect(4);

    LocalCache.get.restore();
    this.stub(LocalCache, 'get', function() { return 'window.foo = "bar";' });

    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 'bar');
    });
    this.clock.tick(1000);

    QUnit.equal(this.requests.length, 0);
    QUnit.equal(LocalCache.store.callCount, 0);
  });

  test('empty zero responses are connection errors', function() {
    QUnit.expect(3);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, 'connection');
    });
    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, '');
    QUnit.equal(LocalCache.store.callCount, 0);
  });
  test('zero responses with content are fine', function() {
    QUnit.expect(4);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 'bar');
    });
    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, 'window.foo = "bar";');
    QUnit.equal(LocalCache.store.callCount, 1);
  });
  test('empty responses with status are acceptable css', function() {
    QUnit.expect(4);
    Loader.loader.loadModule('module1', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 'bar');
    });
    QUnit.equal(this.requests.length, 2);
    this.requests[0].respond(200, {}, '');
    this.requests[1].respond(200, {}, 'window.foo = "bar";');
    QUnit.equal(LocalCache.store.callCount, 2);
  });
  test('empty responses with status are javascript errors', function() {
    QUnit.expect(3);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, 'javascript');
    });
    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, '');
    QUnit.equal(LocalCache.store.callCount, 0);
  });
  test('exec errors are javascript errors', function() {
    QUnit.expect(3);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, 'javascript');
    });
    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, '<foo');
    QUnit.equal(LocalCache.store.callCount, 0);
  });

  test('subsequent requests are made after errors', function() {
    QUnit.expect(6);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, 'connection');

      Loader.loader.loadModule('moduleNoRoute', function(err) {
        QUnit.equal(err, undefined);
        QUnit.equal(window.foo, 'bar');
      });

      QUnit.equal(self.requests.length, 2);
      self.requests[1].respond(200, {}, 'window.foo = "bar";');
      QUnit.equal(LocalCache.store.callCount, 1);
    });

    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, '');
  });

  test('subsequent requests are ignored after success', function() {
    QUnit.expect(7);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 1);

      Loader.loader.loadModule('moduleNoRoute', function(err) {
        QUnit.equal(err, undefined);
        QUnit.equal(window.foo, 1);
      });

      QUnit.equal(self.requests.length, 1);
    });

    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');
    QUnit.equal(LocalCache.store.callCount, 1);
  });

  test('concurrent requests do no cause duplicates', function() {
    QUnit.expect(6);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 1);
    });
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 1);
    });

    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');
    QUnit.equal(LocalCache.store.callCount, 1);
  });

  test('errors in concurrent requests are dispatched', function() {
    QUnit.expect(4);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, 'javascript');
    });
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      QUnit.equal(err, 'javascript');
    });

    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, '<foo');
    QUnit.equal(LocalCache.store.callCount, 0);
  });

  test('backbone routes are reattempted after connection failure', function() {
    QUnit.expect(5);

    this.spy(Backbone.history, 'loadUrl');

    Backbone.history.navigate('module2', true);
    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, '');

    Backbone.history.navigate('');
    Backbone.history.navigate('module2', true);
    QUnit.equal(this.requests.length, 2);
    this.requests[1].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');

    QUnit.equal(Backbone.history.loadUrl.callCount, 3);

    QUnit.deepEqual(window.failedModules, [
      {type: 'connection', module: 'module2'},
      {type: 'missing-route', module: 'module2'}
    ]);
    QUnit.equal(window.foo, 1);
  });
  test('multiple execution for backbone routes does not error', function() {
    QUnit.expect(4);

    this.spy(Backbone.history, 'loadUrl');

    Backbone.history.navigate('module2', true);
    Backbone.history.navigate('module22', true);
    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');

    QUnit.deepEqual(window.failedModules, [
      {type: 'missing-route', module: 'module2'}
    ]);
    QUnit.equal(Backbone.history.loadUrl.callCount, 3);
    QUnit.equal(window.foo, 1);
  });

  test('backbone routes are updated if other load is executing', function() {
    QUnit.expect(6);

    this.spy(Backbone.history, 'loadUrl');

    Loader.loader.loadModule('module2', function(err) {
      QUnit.equal(err, undefined);
      QUnit.equal(window.foo, 1);
    });
    Backbone.history.navigate('module2', true);
    QUnit.equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');

    QUnit.deepEqual(window.failedModules, [
      {type: 'missing-route', module: 'module2'}
    ]);
    QUnit.equal(Backbone.history.loadUrl.callCount, 2);
    QUnit.equal(window.foo, 1);
  });


  test('modules are preloaded', function() {
    QUnit.expect(4);
    var callCount = 0;
    Loader.loader.loadModule('module3', _.bind(function() {
      ++callCount;
      ok(lumbarLoadedModules.module3);
      ok(lumbarLoadedModules.module4);
      ok(!lumbarLoadedModules.module5);
    }, this));
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');
    this.requests[1].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');
    QUnit.equal(callCount, 1);
  });

}, 100);
