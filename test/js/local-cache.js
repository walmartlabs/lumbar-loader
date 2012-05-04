QUnit.module('LocalCache', {
  setup: function() {
    var config = this.config = {};
    function keys(obj) {
      var ret = [];
      for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
          ret.push(name);
        }
      }
      return ret;
    }
    this.storage = {
      get length() {
        return keys(config).length;
      },
      key: this.spy(function(i) { return keys(config)[i]; }),
      getItem: this.spy(function(name) { return config[name]; }),
      setItem: this.spy(function(name, value) { config[name] = value; }),
      removeItem: this.spy(function(name) { delete config[name]; })
    };

    this.cache = LocalCache;
    LocalCache = LocalCache.constructor(this.storage);
  },
  teardown: function() {
    LocalCache = this.cache;
  }
});

test('value stored - no ttl', function() {
  LocalCache.store('test', 'test');
  equal(this.storage.setItem.callCount, 1);

  equal(LocalCache.get('test'), 'test');
  equal(this.storage.getItem.callCount, 2);
  equal(this.storage.setItem.callCount, 1);
});
test('value stored - hour ttl', function() {
  LocalCache.store('test', 'test', LocalCache.TTL.HOUR);
  equal(this.storage.setItem.callCount, 3);

  equal(LocalCache.get('test'), 'test');
  equal(this.storage.getItem.callCount, 2);
  equal(this.storage.setItem.callCount, 4);
});

test('ttl expired', function() {
  LocalCache.store('test', 'test', LocalCache.TTL.HOUR);
  equal(this.storage.setItem.callCount, 3);

  this.clock.tick(LocalCache.TTL.HOUR()+1);

  equal(LocalCache.get('test'), undefined);
  equal(this.storage.setItem.callCount, 3);
  equal(this.storage.removeItem.callCount, 3);
});

test('remove - no ttl', function() {
  LocalCache.store('test', 'test');
  ok(this.storage.setItem.calledOnce);

  LocalCache.remove('test');
  equal(this.storage.removeItem.callCount, 3);

  equal(LocalCache.get('test'), undefined);
  equal(this.storage.getItem.callCount, 2);
  equal(this.storage.setItem.callCount, 1);
});
test('remove - hour ttl', function() {
  // Use something other than zero as that's all we'll see in the real world(tm)
  this.clock.tick(10);

  LocalCache.store('test', 'test', LocalCache.TTL.HOUR);
  equal(this.storage.setItem.callCount, 3);

  LocalCache.remove('test');
  equal(this.storage.removeItem.callCount, 3);

  equal(LocalCache.get('test'), undefined);
  equal(this.storage.getItem.callCount, 2);
  equal(this.storage.setItem.callCount, 3);
});

test('reset', function() {
  LocalCache.store('test', 'test');
  LocalCache.store('test2', 'test', LocalCache.TTL.HOUR);
  LocalCache.reset();

  equal(this.storage.removeItem.callCount, 3);
  equal(LocalCache.get('test'), 'test');
});
test('reset - hard', function() {
  LocalCache.store('test', 'test');
  LocalCache.store('test2', 'test', LocalCache.TTL.HOUR);
  LocalCache.reset(true);
  deepEqual(this.config, {});
});

test('flush expired', function() {
  LocalCache.store('test', 'test', LocalCache.TTL.hours(0.5));
  LocalCache.store('test2', 'test', LocalCache.TTL.WEEK);
  LocalCache.store('test3', 'test');
  equal(this.storage.setItem.callCount, 7);
  equal(this.storage.getItem.callCount, 0);

  this.clock.tick(LocalCache.TTL.HOUR()+1);

  equal(this.storage.getItem.callCount, 4); // Flush runs twice
  equal(this.storage.setItem.callCount, 7);
  equal(this.storage.removeItem.callCount, 3);
  equal(LocalCache.get('test2'), 'test');
  equal(LocalCache.get('test3'), 'test');
});

test('zero quota should not throw', function() {
  this.storage.setItem = this.spy(function() { var err = new Error(); err.name = 'QUOTA_EXCEEDED_ERR'; throw err; });

  ok(!LocalCache.store('test', 'test', LocalCache.TTL.hours(0.5)));
  ok(!LocalCache.store('test2', 'test', LocalCache.TTL.WEEK));
  ok(!LocalCache.store('test3', 'test'));

  equal(this.storage.setItem.callCount, 3);
});

test('quota with no expires', function() {
  var self = this;

  this.storage.setItem = this.spy(function(name, value) {
    if (self.storage.length > 0) {
      var err = new Error();
      err.name = 'QUOTA_EXCEEDED_ERR';
      throw err;
    } else {
      self.config[name] = value;
    }
  });

  ok(LocalCache.store('test', 'test'));
  equal(this.storage.removeItem.callCount, 0);

  ok(!LocalCache.store('test2', 'test'));

  equal(this.storage.setItem.callCount, 2);
  equal(this.storage.removeItem.callCount, 0);

  equal(LocalCache.get('test'), 'test');
  equal(LocalCache.get('test2'), undefined);
});
test('quota with expires', function() {
  var self = this;

  this.storage.setItem = this.spy(function(name, value) {
    if (self.storage.length > 2) {
      var err = new Error();
      err.name = 'QUOTA_EXCEEDED_ERR';
      throw err;
    } else {
      self.config[name] = value;
    }
  });

  ok(LocalCache.store('test', 'test', LocalCache.TTL.HOUR));
  equal(this.storage.removeItem.callCount, 0);

  ok(LocalCache.store('test2', 'test'));

  equal(this.storage.setItem.callCount, 5);
  equal(this.storage.removeItem.callCount, 3);

  equal(LocalCache.get('test'), undefined);
  equal(LocalCache.get('test2'), 'test');
});
test('quota removing all expires but still lacking space', function() {
  LocalCache.store('test', 'test', LocalCache.TTL.hours(0.5));
  LocalCache.store('test2', 'test', LocalCache.TTL.WEEK);
  equal(this.storage.setItem.callCount, 6);

  this.storage.setItem = this.spy(function() { var err = new Error(); err.name = 'QUOTA_EXCEEDED_ERR'; throw err; });

  ok(!LocalCache.store('test3', 'test'));
  equal(this.storage.removeItem.callCount, 6);
  equal(this.storage.setItem.callCount, 3);

  equal(LocalCache.get('test'), undefined);
  equal(LocalCache.get('test2'), undefined);
  equal(LocalCache.get('test3'), undefined);
});

test('existing get in private mode', function() {
  ok(LocalCache.store('test2', 'test', LocalCache.TTL.WEEK));
  equal(this.storage.setItem.callCount, 3);

  this.storage.setItem = this.spy(function() { var err = new Error(); err.name = 'QUOTA_EXCEEDED_ERR'; throw err; });

  equal(LocalCache.get('test2'), 'test');
});
