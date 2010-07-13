///////////////////////////////////////////////////////////
/**
 * @param {Object}ctx
 * @param {Function|String}func
 * @param {Array}args
 * @return {Function} hitched function
 */
exports.hitch = function(ctx, func, args) {
  if (typeof func == 'string') {
    func = ctx ? ctx[func] : eval('(' + func + ')');
  }
  return function() {
    var merged;
    if (args) {
      merged = [];
      for(var i = 0; i < arguments.length; i++) {
        merged[i] = arguments[i];
      }
      merged = merged.concat(args);
    } else {
      merged = arguments;
    }
    return func.apply(ctx, merged);
  };
};
