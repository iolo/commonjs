///////////////////////////////////////////////////////////
/**
 * PYLON.ajax({ method:str, url:str, async:BOOL, headers:OBJECT, data:OBJECT, callback:func, errback:func })
 * @param {Object}args
 * @return {Object}xhr
 */
exports.ajax = function(args) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(4 == xhr.readyState) {
      if(200 == xhr.status) {
        args.callback(xhr);
        return;
      }
      args.errback(xhr);
	}
  };
  try {
    xhr.open(args.method, args.url, args.async);
	if (args.headers) {
      for (var key in args.headers) {
	    if (key) {
          xhr.setRequestHeader(key, args.headers[key]);
		}
      }
	}
    xhr.send(args.data);
  } catch(e) {
    args.errback(xhr, e);
  }
  return xhr;
};

