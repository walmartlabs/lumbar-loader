(function() {
  lumbarLoader.initEvents = function() {
    // Needs to be defered until we know that backbone has been loaded
    _.extend(lumbarLoader, Backbone.Events);
  };
  if (window.Backbone) {
    lumbarLoader.initEvents();
  }

  var baseLoadModule = lumbarLoader.loadModule;
  lumbarLoader.loadModule = function(moduleName, callback) {
    lumbarLoader.trigger && lumbarLoader.trigger('load:start', moduleName);
    baseLoadModule(moduleName, function(error) {
      lumbarLoader.trigger && lumbarLoader.trigger('load:end', moduleName);
      callback(error);
    });
  };
})();
