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
      lumbarLoadedModules = {};
      lumbarLoadedResources = {};
      Backbone.history.navigate('', true);
    }
  });

  test('empty zero responses are connection errors', function() {
    expect(3);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, 'connection');
    });
    equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, '');
    equal(LocalCache.store.callCount, 0);
  });
  test('zero responses with content are fine', function() {
    expect(4);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, undefined);
      equal(window.foo, 'bar');
    });
    equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, 'window.foo = "bar";');
    equal(LocalCache.store.callCount, 1);
  });
  test('empty responses with status are acceptable css', function() {
    expect(4);
    Loader.loader.loadModule('module1', function(err) {
      equal(err, undefined);
      equal(window.foo, 'bar');
    });
    equal(this.requests.length, 2);
    this.requests[0].respond(200, {}, '');
    this.requests[1].respond(200, {}, 'window.foo = "bar";');
    equal(LocalCache.store.callCount, 2);
  });
  test('empty responses with status are javascript errors', function() {
    expect(3);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, 'javascript');
    });
    equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, '');
    equal(LocalCache.store.callCount, 0);
  });
  test('exec errors are javascript errors', function() {
    expect(3);
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, 'javascript');
    });
    equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, '<foo');
    equal(LocalCache.store.callCount, 0);
  });

  test('subsequent requests are made after errors', function() {
    expect(6);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, 'connection');

      Loader.loader.loadModule('moduleNoRoute', function(err) {
        equal(err, undefined);
        equal(window.foo, 'bar');
      });

      equal(self.requests.length, 2);
      self.requests[1].respond(200, {}, 'window.foo = "bar";');
      equal(LocalCache.store.callCount, 1);
    });

    equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, '');
  });

  test('subsequent requests are ignored after success', function() {
    expect(7);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, undefined);
      equal(window.foo, 1);

      Loader.loader.loadModule('moduleNoRoute', function(err) {
        equal(err, undefined);
        equal(window.foo, 1);
      });

      equal(self.requests.length, 1);
    });

    equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');
    equal(LocalCache.store.callCount, 1);
  });

  test('concurrent requests do no cause duplicates', function() {
    expect(6);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, undefined);
      equal(window.foo, 1);
    });
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, undefined);
      equal(window.foo, 1);
    });

    equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');
    equal(LocalCache.store.callCount, 1);
  });

  test('errors in concurrent requests are dispatched', function() {
    expect(4);

    var self = this;
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, 'javascript');
    });
    Loader.loader.loadModule('moduleNoRoute', function(err) {
      equal(err, 'javascript');
    });

    equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, '<foo');
    equal(LocalCache.store.callCount, 0);
  });

  test('backbone routes are reattempted after connection failure', function() {
    expect(7);

    this.spy(Backbone.history, 'loadUrl');

    Backbone.history.navigate('module2', true);
    equal(this.requests.length, 1);
    this.requests[0].respond(0, {}, '');

    Backbone.history.navigate('');
    Backbone.history.navigate('module2', true);
    equal(this.requests.length, 2);
    this.requests[1].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');

    equal(Backbone.history.loadUrl.callCount, 3);

    equal(window.failedModules.length, 1);
    equal(window.failedModules[0].type, 'connection');
    equal(window.failedModules[0].module, 'module2');
    equal(window.foo, 1);
  });
  test('multiple execution for backbone routes does not error', function() {
    expect(3);

    this.spy(Backbone.history, 'loadUrl');

    Backbone.history.navigate('module2', true);
    Backbone.history.navigate('module22', true);
    equal(this.requests.length, 1);
    this.requests[0].respond(200, {}, 'window.foo = (window.foo || 0) + 1;');

    equal(Backbone.history.loadUrl.callCount, 3);
    equal(window.foo, 1);
  });
}, 100);
