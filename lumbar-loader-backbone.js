module.exports.initBackboneLoader = function(loaderModule, failure) {
  var lumbarLoader = (loaderModule || module.exports).loader;

  // Setup backbone route loading
  var handlers = {
    routes: {}
  };

  for (var moduleName in lumbarLoader.map.modules) {
    handlers['loader_' + moduleName] = (function(moduleName) {
      return function() {
        if (lumbarLoader.isLoaded(moduleName)) {
          return;
        }

        lumbarLoader.loadModule(moduleName, function() {
          // Reload with the new route
          Backbone.history.loadUrl();
        });
      };
    })(moduleName);
  }

  // For each route create a handler that will load the associated module on request
  for (var route in lumbarLoader.map.routes) {
    handlers.routes[route] = 'loader_' + lumbarLoader.map.routes[route];
  }

  new (Backbone.Router.extend(handlers));
};

// Automatically initialize the loader if everything is setup already
if (module.exports.loader && module.exports.loader.map && window.Backbone) {
  module.exports.initBackboneLoader();
}
