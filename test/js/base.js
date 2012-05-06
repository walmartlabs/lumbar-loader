_.extend(exports, Backbone.Events);

window.failedModules = [];

exports.init = function(loaderModule) {
  loaderModule.loader.initEvents();
  exports.initBackboneLoader(loaderModule, function (type, module) {
    failedModules.push({type: type, module: module});
  });
  Backbone.history.start();
};
