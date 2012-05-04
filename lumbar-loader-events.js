(function() {
  lumbarLoader.initEvents = function() {
    // Needs to be defered until we know that backbone has been loaded
    _.extend(lumbarLoader, Backbone.Events);
  };
  if (window.Backbone) {
    lumbarLoader.initEvents();
  }

  var baseLoadModule = lumbarLoader.loadModule;
  lumbarLoader.loadModule = function(moduleName, callback, options) {
    options = options || {};
    if (!options.silent) {
      lumbarLoader.trigger && lumbarLoader.trigger('load:start', moduleName);
    }
    baseLoadModule(moduleName, function() {
      if (!options.silent) {
        lumbarLoader.trigger && lumbarLoader.trigger('load:end', moduleName);
      }
      callback();
    }, options);
  };
})();
