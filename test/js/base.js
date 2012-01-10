_.extend(exports, Backbone.Events);

exports.init = function(loaderModule) {
  loaderModule.loader.initEvents();
  exports.initBackboneLoader(loaderModule);
  Backbone.history.start();
};
