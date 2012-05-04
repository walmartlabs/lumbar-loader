lumbarLoader.loadJS = function(moduleName, callback) {
  var loaded = loadResources(moduleName, 'js', function(href) {
    loadViaXHR(href, function(data) {
      if (data) {
        window.eval(data);
      }
      callback();
    });
    return 1;
  });
  return loaded.length;
};
lumbarLoader.loadCSS = function(moduleName, callback) {
  var loaded = loadResources(moduleName, 'css', function(href) {
    loadViaXHR(href, function(data) {
      data && exports.loader.loadInlineCSS(data);
      callback();
    });
    return 1;
  });
  return loaded.length;
};

function loadViaXHR(href, callback) {
  var cache = LocalCache.get(href);
  if (cache) {
    // Dump off the stack to prevent any errors with loader module interaction
    setTimeout(function() {
      callback(cache);
    }, 0);

    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function(){
    if (xhr.readyState == 4) {
      var success = (xhr.status >= 200 && xhr.status < 300) || xhr.status == 0;
      if (success) {
        LocalCache.store(href, xhr.responseText, LocalCache.TTL.WEEK);
      }

      callback(success && xhr.responseText);
    }
  };

  xhr.open('GET', href, true);
  xhr.send(null);
}
