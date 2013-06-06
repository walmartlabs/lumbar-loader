/*global _, Backbone, lumbarLoader */
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

    var loaded = lumbarLoader.isLoaded(moduleName);
    if (!options.silent && !loaded) {
      lumbarLoader.trigger && lumbarLoader.trigger('load:start', moduleName, undefined, lumbarLoader);
    }
    baseLoadModule(moduleName, function(error) {
      if (!options.silent && !loaded) {
        lumbarLoader.trigger && lumbarLoader.trigger('load:end', lumbarLoader);
      }
      callback(error);
    }, options);
  };
}());
