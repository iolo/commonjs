///////////////////////////////////////////////////////////
/**
 * <code>
 * property(this, 'foo', '_foo');
 * property(this, 'bar', '_bar', true);
 * property(this, 'hello', function() { return this._foo; });
 * property(this, 'world', function() { return this._foo; }, function(val) { this._foo = val; });
 * </code>
 * @param {Object}ctx
 * @param {String}prop
 * @param ...
 */
exports.property = function(ctx, prop) {
  if (typeof arguments[2] == 'string') {
    var varname = arguments[2];
    ctx.__defineGetter__(prop, function() { return ctx[varname]; });
    if ((arguments.length == 4) && arguments[3]) {
      ctx.__defineSetter__(prop, function(val) { ctx[varname] = val; });
    }
  } else if (typeof arguments[2] == 'function') {
    var getter = arguments[2];
    ctx.__defineGetter__(prop, function() { return getter.call(ctx); });
    if ((arguments.length == 4) && (typeof arguments[3] == 'function')) {
      var setter = arguments[3];
      ctx.__defineSetter__(prop, function(val) { setter.call(ctx, val); });
    }
  }
};
