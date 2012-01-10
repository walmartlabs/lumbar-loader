new (Backbone.Router.extend({
  routes: module.routes,

  module1: function() {
    LoaderTest.trigger('load', 'module1');
  }
}));
