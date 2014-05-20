/*jshint loopfunc:true */
/*global $, $serverSide, exports, lumbarLoadPrefix */

this.$serverSide = typeof this.$serverSide !== 'undefined' && this.$serverSide;

var lumbarLoader = exports.loader = {
  loadPrefix: typeof lumbarLoadPrefix === 'undefined' ? '' : lumbarLoadPrefix,
  preloadTimeout: 5000,

  isLoaded: function(moduleName) {
    return lumbarLoadedModules[moduleName] === true;
  },
  isLoading: function(moduleName) {
    return !!lumbarLoadedModules[moduleName];
  },

  loadModule: function(moduleName, callback, options) {
    options = options || {};

    var loaded = lumbarLoadedModules[moduleName];
    if (loaded) {
      // We have already been loaded or there is something pending. Handle it
      if (loaded === true) {
        callback();
      } else {
        loaded.push(callback);
      }
      return;
    }

    loaded = lumbarLoadedModules[moduleName] = [callback];

    var loadCount = 0,
        expected = 1,
        allInit = false,
        moduleInfo = lumbarLoader.modules && lumbarLoader.modules[moduleName];

    function complete(error) {
      loadCount++;
      if (error || (allInit && loadCount >= expected)) {
        lumbarLoadedModules[moduleName] = !error;
        if (moduleInfo && moduleInfo.preload && !options.silent && !$serverSide) {
          setTimeout(function() {
            preloadModules(moduleInfo.preload);
          }, lumbarLoader.preloadTimeout);
        }
        for (var i = 0, len = loaded.length; i < len; i++) {
          loaded[i](error);
        }
        lumbarLoader.loadComplete && lumbarLoader.loadComplete(moduleName, error);
      }
    }

    function loadResources(error) {
      if (!error) {
        expected += lumbarLoader.loadCSS(moduleName, complete);
        expected += lumbarLoader.loadJS(moduleName, complete);
        // If everything was done sync then fire away
        allInit = true;
      }
      complete(error);
    }

    if (moduleInfo && moduleInfo.depends) {
      var dep = moduleInfo.depends,
          queue = self.queue();
      for (var i=0; i<dep.length; i++) {
        queue.defer(function(dependency, callback) {
          lumbarLoader.loadModule(dependency, callback, options);
        }, dep[i]);
      }
      queue.awaitAll(loadResources);
    } else {
      loadResources();
    }
  },

  loadInlineCSS: function(content) {
    var style = document.createElement('style');
    style.textContent = content;
    appendResourceElement(style);
    return style;
  }
};

var lumbarLoadedModules = {},
    lumbarLoadedResources = {},
    fieldAttr = {
      js: 'src',
      css: 'href'
    };
function loadResources(moduleName, field, callback, create) {
  var module = (moduleName === 'base' && lumbarLoader.map.base) || lumbarLoader.modules[moduleName], // Special case for the base case
      loaded = [],
      attr = fieldAttr[field];
  field = module[field] || [];

  if (Array.isArray ? !Array.isArray(field) : Object.prototype.toString.call(field) !== '[object Array]') {
    field = [field];
  }
  for (var i = 0, len = field.length; i < len; i++) {
    var object = field[i];
    var href = checkLoadResource(object, attr);
    if (href && !lumbarLoadedResources[href]) {
      var el = create(href, function(err) {
        if (err && err.type === 'connection') {
          lumbarLoadedResources[href] = false;
        }
        callback(err);
      });
      lumbarLoadedResources[href] = true;
      if (el && el.nodeType === 1) {
        appendResourceElement(el);
      }
      loaded.push(el);
    }
  }
  return loaded;
}

function appendResourceElement(element) {
  return (document.head || document.getElementsByTagName('head')[0] || document.body).appendChild(element);
}

function preloadModules(modules) {
  for (var i = 0, len = modules.length; i < len; i++) {
    lumbarLoader.loadModule(modules[i], function() {}, {silent: true});
  }
}

var devicePixelRatio;
try {
  devicePixelRatio = sessionStorage.getItem('dpr');
} catch (err) {
  /* NOP : Ignore security exception under iOS 7 private browsing mode */
}
devicePixelRatio = parseFloat(devicePixelRatio || window.devicePixelRatio || (window.screen && (window.screen.deviceXDPI / window.screen.logicalXDPI)) || 1);
exports.devicePixelRatio = devicePixelRatio;
function checkLoadResource(object, attr) {
  var href = lumbarLoader.loadPrefix + (object.href || object),

      // Strip the server component, if one exists
      pathname = href.replace(/^.*?:\/\/.*?\//, '');

  if ((!object.maxRatio || devicePixelRatio < object.maxRatio) && (!object.minRatio || object.minRatio <= devicePixelRatio)) {
    // Search for the suffix without the server information, if href includes it. In effect we are
    // treating https://foo/bar as the same as /bar. There is the possibilty of conflict here, but
    // this is relatively unlikely.
    // The second clause checks for explicit references to this resource that do not have the
    // data-lumbar flag applied to them. This allows the most ammount of flexibility for consumers.
    var query = '[data-lumbar][' + attr + '$="' + pathname + '"],[' + attr + '="' + href + '"]';

    // If we are in fruit-loops without full DOM support then we want to use $, which we are
    // assuming is available.
    if (document.querySelector ? document.querySelector(query) : $(query).length) {
      return;
    }

    return href;
  }
}

exports.moduleMap = function(map, loadPrefix) {
  lumbarLoader.map = map;
  lumbarLoader.modules = map.modules;
  lumbarLoader.loadPrefix = loadPrefix || lumbarLoader.loadPrefix;
};
