this.LocalCache = (function constructor(localStorage) {
  var MS_IN_HOUR = 3600000,   // 60*60*1000
      MS_IN_DAY = 24*MS_IN_HOUR,
      PREFIX = 'LocalCache_',
      EXPIRES_KEY = 'Expires_',
      ACCESS_KEY = 'Access_',
      EXPIRES_REGEX = /^LocalCache_Expires_.*/,
      ALL_REGEX = /^LocalCache_.*/;

  var stubbedStorage;

  var TTL = {
    WEEK: function() {
      return TTL.DAY() + 6*MS_IN_DAY;
    },
    DAY: function() {
      var date = new Date(),
          originalDay = date.getDate(),
          originalHours = date.getHours();
      date.setUTCHours(10 /* 2am PST, 3am PDT */, 0, 0, 0);

      // If we are after midnight but before the expires we don't want to change anything
      if (date.getHours() <= originalHours) {
        date.setDate(originalDay + 1);
      }
      return date.getTime();
    },
    HOUR: function() {
      return (Math.floor(Date.now()/MS_IN_HOUR)+1)*MS_IN_HOUR;
    },
    hours: function(numHours) {
      return function() {
        return Date.now() + (MS_IN_HOUR * numHours);
      };
    }
  };

  // http://stackoverflow.com/questions/3027142/calculating-usage-of-localstorage-space
  function isQuotaError(error) {
    return error.code === 22
        || error.name === 'QUOTA_EXCEEDED_ERR'
        || error.name === 'QuotaExceededError'
        || error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
  }

  function checkStorage() {
    function tryStore() {
      localStorage.setItem('available-test', '1');
      localStorage.removeItem('available-test');
    }
    try {
      // iOS 7 betas throw a security exception when attempting to even read .localStorage
      // This is hopefully a bug but we're coding against it to be safe.
      localStorage = localStorage || window.localStorage;

      tryStore();
    } catch (err) {
      if (isQuotaError(err)) {
        try {
          // If we have a quota error, try one more time.
          flushExpired();

          tryStore()

          // We worked this time, full steam ahead.
          return;
        } catch (err) {
          /* NOP */
        }
      }

      stubStorage();
    }
  }

  function stubStorage() {
    stubbedStorage = true;
    var localStorageData = {};
    localStorage = {
      getItem: function(name) {
        return localStorageData[name];
      },
      setItem: function(name, value) {
        localStorageData[name] = value;
      },
      removeItem: function(name) {
        delete localStorageData[name];
      }
    };
  }

  function setKey(key, data, ttl) {
    if (ttl) {
      if (stubbedStorage) {
        // Do not store any data that has a TTL in stubbed mode as this data is already
        // not guaranteed, it can be quite large, and it will never be evicted.
        return;
      }

      localStorage.setItem(PREFIX+EXPIRES_KEY+key, ttl());
      localStorage.setItem(PREFIX+ACCESS_KEY+key, Date.now());
    }
    localStorage.setItem(PREFIX+key, data);
  }
  function removeKey(key) {
    localStorage.removeItem(PREFIX+EXPIRES_KEY+key);
    localStorage.removeItem(PREFIX+ACCESS_KEY+key);
    localStorage.removeItem(PREFIX+key);
  }
  function loadByAccess() {
    var ret = [];
    for (var i = 0, len = localStorage.length; i < len; i++) {
      var key = localStorage.key(i);
      if (EXPIRES_REGEX.test(key)) {
        key = key.substring(PREFIX.length + EXPIRES_KEY.length);
        ret.push({
          key: key,
          access: parseInt(localStorage.getItem(PREFIX+ACCESS_KEY+key) || 0, 10)
        });
      }
    }
    ret.sort(function(a, b) { return a.access-b.access; });
    return ret;
  }

  function flushExpired() {
    var now = Date.now(),
        toRemove = [];

    // Iterate over everything, scanning for anything that may be expired
    for (var i = 0, len = localStorage.length; i < len; i++) {
      var key = localStorage.key(i);
      if (EXPIRES_REGEX.test(key)) {
        if (parseInt(localStorage.getItem(key), 10) < now) {
          toRemove.push(key.substring(PREFIX.length + EXPIRES_KEY.length));
        }
      }
    }

    // Actually remove everything
    for (var i = 0, len = toRemove.length; i < len; i++) {
      removeKey(toRemove[i]);
    }
  }

  checkStorage();
  if (!stubbedStorage && (typeof $serverSide === 'undefined' || !$serverSide)) {
    // Kill any expired content that may be in the cache as soon as we get the chance
    setTimeout(flushExpired, 0);

    // And flush every hour, if we are on the same page for that long
    // No need to run more often than that as the shortest expiration time is 1 hour
    setInterval(flushExpired, MS_IN_HOUR);
  }

  return {
    // Exposed for unit testing purposes
    constructor: constructor,

    TTL: TTL,

    store: function(key, data, ttl) {
      // Iterate until we can store the data, we block out the cache, or we
      // hit an exception that is not a quote exception
      var cullList;
      while (!cullList || cullList.length) {
        cullList && cullList.shift();

        try {
          // Attempt to set once before loading the whole cache
          setKey(key, data, ttl);
          return true;
        } catch (err) {
          // If quota drop the things that are closest to expiration out of the cache
          if (isQuotaError(err)) {
            cullList = cullList || loadByAccess();
            if (cullList.length) {
              removeKey(cullList[0].key);
            }
          } else {
            throw err;
          }
        }
      }
    },
    get: function(key) {
      var expires = localStorage.getItem(PREFIX+EXPIRES_KEY+key) || 0;
      if (expires && parseInt(expires, 10) < Date.now()) {
        // Kill anything that may have expired
        removeKey(key);
        return;
      }

      if (expires) {
        try {
          localStorage.setItem(PREFIX+ACCESS_KEY+key, Date.now());
        } catch (err) {
          /* NOP: This may occur in private browsing mode... Playing it safe in case cached data surivives there. */
        }
      }
      return localStorage.getItem(PREFIX+key);
    },
    remove: function(key) {
      removeKey(key);
    },
    invalidate: function(prefix, hard) {
      var toRemove = [];

      for (var i = 0, len = localStorage.length; i < len; i++) {
        var key = localStorage.key(i);
        if ((hard ? ALL_REGEX : EXPIRES_REGEX).test(key)) {
          var key = key.substring(PREFIX.length + (!hard ? EXPIRES_KEY.length : 0));
          if (!prefix || key.indexOf(prefix) === 0) {
            toRemove.push(key);
          }
        }
      }

      // Actually remove everything
      toRemove.forEach(removeKey);
    },
    reset: function(hard) {
      this.invalidate('', hard);
    },
    flushExpired: flushExpired
  };
}());
