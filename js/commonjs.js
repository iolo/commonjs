///////////////////////////////////////////////////////////
require = function() {
  var _global = window;
  var _moduleBaseUrl = './js/modules/';
  var _modules = { };

  /**
   *
   * @param {String}name
   * @return {Object}module
   */
  var require = function(name) {
    var module = _modules[name];
    if (module) {
      return module.exports;
    }
    module = {
      name: name,
      exports: { }
    };
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(4 == xhr.readyState) {
        if(200 == xhr.status) {
          var stmt = '(function(module,exports,require){' + xhr.responseText + '})';
          var func = eval(stmt);
          func.apply(_global, [ module, module.exports, require ]);
          _modules[name] = module;
          return;
        }
        throw new Error('failed to load module: ' + name);
       }
    };
    var url = _moduleBaseUrl + name.replace('.', '/') + '.js';
    xhr.open('GET', url, false);
    xhr.send(null);
    return module.exports;
  };

  return require;
}();
