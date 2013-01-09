new (Backbone.Router.extend({
  routes: module.routes,

  hasDepends: function() {
    LoaderTest.trigger('load', 'has-depends');
  }
}));
