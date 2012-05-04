setTimeout(function(){
  QUnit.module("Local Storage Loader Error Handling", {
    setup: function() {
      this.stub(LocalCache, 'get');
      this.stub(LocalCache, 'store');

      this.xhr = sinon.useFakeXMLHttpRequest();
      var requests = this.requests = [];

      this.xhr.onCreate = function (xhr) {
        requests.push(xhr);
      };
    },
    teardown: function() {
      this.xhr.restore();
      lumbarLoadedResources = {};
    }
  });
}, 100);
