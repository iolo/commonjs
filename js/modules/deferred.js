//////////////////////////////////////////////////////
/**
 * module: deferred
 */

var _deferred_id = 0;

var Deferred = function (/* optional */ canceller) {
    this.chain = [];
    this.id = _deferred_id++;
    this.fired = -1;
    this.paused = 0;
    this.results = [null, null];
    this.canceller = canceller;
    this.silentlyCancelled = false;
    this.chained = false;
};

Deferred.prototype.cancel = function () {
	if (this.fired == -1) {
		if (this.canceller) {
			this.canceller(this);
		} else {
			this.silentlyCancelled = true;
		}
		if (this.fired == -1) {
			this.errback(new Error("CancelledError(this)"));
		}
	} else if ((this.fired === 0) && (this.results[0] instanceof Deferred)) {
		this.results[0].cancel();
	}
};

/***
The primitive that means either callback or errback
***/
Deferred.prototype._resback = function (res) {
	this.fired = ((res instanceof Error) ? 1 : 0);
	this.results[this.fired] = res;
	this._fire();
};

Deferred.prototype._check = function () {
	if (this.fired != -1) {
		if (!this.silentlyCancelled) {
			throw new Error("AlreadyCalledError:" + this.id);
		}
		this.silentlyCancelled = false;
		return;
	}
};

Deferred.prototype.callback = function (res) {
	this._check();
	if (res instanceof Deferred) {
		throw new Error("Deferred instances can only be chained if they are the result of a callback");
	}
	this._resback(res);
};

Deferred.prototype.errback = function (res) {
	this._check();
	if (res instanceof Deferred) {
		throw new Error("Deferred instances can only be chained if they are the result of a callback");
	}
	if (!(res instanceof Error)) {
		res = new Error("GenericError(res)");
	}
	this._resback(res);
};

Deferred.prototype.addCallbacks = function (cb, eb) {
	if (this.chained) {
		throw new Error("Chained Deferreds can not be re-used");
	}
	this.chain.push([cb, eb]);
	if (this.fired >= 0) {
		this._fire();
	}
	return this;
};

/***
Used internally to exhaust the callback sequence when a result
is available.
***/
Deferred.prototype._fire = function () {
	var chain = this.chain;
	var fired = this.fired;
	var res = this.results[fired];
	var self = this;
	var cb = null;
	while (chain.length > 0 && this.paused === 0) {
		// Array
		var pair = chain.shift();
		var f = pair[fired];
		if (f === null) {
			continue;
		}
		try {
			res = f(res);
			fired = ((res instanceof Error) ? 1 : 0);
			if (res instanceof Deferred) {
				cb = function (res) {
					self._resback(res);
					self.paused--;
					if ((self.paused === 0) && (self.fired >= 0)) {
						self._fire();
					}
				};
				this.paused++;
			}
		} catch (err) {
			fired = 1;
			if (!(err instanceof Error)) {
				err = new Error("GenericError(err)");
			}
			res = err;
		}
	}
	this.fired = fired;
	this.results[fired] = res;
	if (cb && this.paused) {
		// this is for "tail recursion" in case the dependent deferred
		// is already fired
		res.addCallbacks(cb, cb);
		res.chained = true;
	}
};

exports.Deferred = Deferred;

