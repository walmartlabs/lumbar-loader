_.extend(exports, Backbone.Events);

window.failedModules = [];

exports.init = function(loaderModule) {
  loaderModule.loader.initEvents();
  exports.initBackboneLoader(loaderModule, function (msg) {
    failedModules.push(msg);
  });
  Backbone.history.start();
};
