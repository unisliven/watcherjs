/**
 * watcher.js v1.0
 * author: liven
 * license: MIT
 */
(function(global, factory) {
    typeof module !== 'undefined' && typeof exports === 'object'
        ? module.exports = factory()
        : typeof define === 'function' && define.amd
        ? define('watcher',[],factory)
        : (global.Watcher = factory());
}(this, function(undefined) {
    'use strict';

    var version = '1.0';

    var
        _noop = function () {},
        _warn = function (msg) {
            msg = '[watcher warn] '+ msg;
            console.warn(msg);
        },
        _error = function (msg) {
            msg = '[watcher error] '+ msg;
            throw msg;
        };

    var
        objProto = Object.prototype,
        arrProto = Array.prototype,
        nativeForEach = arrProto.forEach,
        splice = arrProto.splice,
        hasOwn = objProto.hasOwnProperty,
        objToString = objProto.toString,
        defineProp = Object.defineProperty;

    var
        isFunction = function util$isFunction(obj){
            return objToString.call(obj) === '[object Function]';
        },
        isPlainObject = function util$isPlainObject(obj){
            return objToString.call(obj) === '[object Object]';
        },
        isArray = function util$isArray(obj){
            return objToString.call(obj) === '[object Array]';
        },
        idMaker = function util$idMaker() {
            return '' + (Date.now() + 1);
        },
        protoMixin  = function util$protoMixin(constuctor, protoObj) {
            constuctor.prototype = protoObj;
            defineProp(protoObj, 'constuctor', {
                enumerable: false,
                writable: true,
                configurable: true,
                value: constuctor
            });
            return constuctor;
        };

    var breaker = Object.create(null);
    var each = function util$each(obj, iterator, context) {
        if (!obj) {
            return obj;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            var i = 0, length = obj.length;
            for (; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        } else {
            for (var key in obj) {
                if (hasOwn.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) {
                        return;
                    }
                }
            }
        }
        return obj;
    };

    var extend = function util$extend(target, source, deep) {
        var name, src, copy, copyIsArray, clone;

        if(typeof deep !== 'boolean'){
            deep = false;
        }

        if ( typeof target !== "object" && !isFunction(target) ) {
            target = {};
        }

        for ( name in source ) {
            if (hasOwn.call(source, name)) {
                src = target[name];
                copy = source[name];

                if (target === copy) {
                    continue;
                }

                if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)) )) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }
                    target[name] = extend(clone, copy, deep);

                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }

        return target;
    };

    /**
     * watcher
     * */
    function Watcher(obj){
        if(!(this instanceof Watcher)){
            _warn('Watcher is a constructor and should be called with the `new` keyword');
            return;
        }
        this._init_(obj);
    }

    Watcher.$version = version;

    /**
     * WO
     * */
    function WO(){
        this.length = 0;
    }

    protoMixin(WO, {
        splice: splice,
        push: function _$WO$push(item) {
            return arrProto.push.call(this, item);
        },
        notify: function _$WO$notify() {
            if(!this.length){
                return;
            }
            each(this, function (item, i) {
                item.$active && item.fire();
            });
        },
        teardown: function _$WO$teardown(index) {
            try {
                this.splice.apply(this, [index, 1]);
                return true;
            } catch(e) {
                _error(e);
                return false;
            }
        }
    });

    var wo = new WO();

    var _$Watcher$$proto = {
        _init_: function _$Watcher$_init_(obj){
            if(!isPlainObject(obj)){
                return;
            }
            _generateObj(this, obj);
        },
        _$watchers: wo,
        watch: function _$Watcher$watch(exp, callback) {
            if(!exp){
                return;
            }
            var watcher = new WatcherConf(exp, callback).active(this);
            var i = this._$watchers.push(watcher);
            var _this = this;
            return function _$Watcher$unwatch() {
                return _this._$watchers.teardown(i - 1);
            };
        },
        copy: function _$Watcher$copy() {
            try {
                return extend({}, this, true);
            } catch(e) {
                _error(e);
                return {};
            }
        }
    };

    protoMixin(Watcher, _$Watcher$$proto);

    /**
     * WatcherConf
     *watcher配置对象
     * */
    function WatcherConf(exp, callback){
        return this._init_.apply(this, arguments);
    }

    protoMixin(WatcherConf, {
        _init_: function _$WatcherConf$_init_(exp, callback){
            this._$exp = exp || '';
            this._cb = callback || _noop;
            return this;
        },
        active: function _$WatcherConf$active(target) {
            if(target){
                this._$m = target;
                this.$active = true;
                this._$value = this._getNewValue();
            }
            return this;
        },
        $active: false,
        _$m: {},
        _$value: undefined,
        _$exp: '',
        _$id: idMaker(),
        _$fireCount: 0,
        _cb: _noop,
        _getNewValue: function _$WatcherConf$_getNewValue() {
            try {
                return _parseExpForValue(this._$m, this._$exp);
            } catch(e) {
                _error(e);
            }
        },
        fire: function _$WatcherConf$_fire(){
            var newValue = this._getNewValue(),
                oldValue = this._$value;
            if(!_equal(newValue, oldValue)) {
                this._$fireCount += 1;
                this._cb.apply(this._$m, [newValue, oldValue]);
                this._$value = newValue;
            }
        }
    });
    /**
     *PO
     * */
    function PO(){
        this._init_.apply(this, arguments);
    }
    protoMixin(PO, {
        _init_: function (name, value) {
            var _this = this;
            this._$name = name;
            this._$value = value;
            this.generate = (function () {
                var value = _this.getter();
                if(isPlainObject(value)){
                    return function (proxyObj) {
                        if(!proxyObj){
                            return;
                        }
                        _this._define.apply(_this, arguments);
                        _generateObj(_this._$value = {}, value);
                    };
                } else if(isArray(value)){
                    return function (proxyObj) {
                        if(!proxyObj){
                            return;
                        }
                        _this._define.apply(_this, arguments);
                        _generateArray(_this._$value = [], value);
                    };
                } else {
                    return function (proxyObj) {
                        if(!proxyObj){
                            return;
                        }
                        _this._define.apply(_this, arguments);
                    };
                }
            }());
        },
        _define: function (proxyObj) {
            var _this = this;
            var propConfig = {
                set: function (value){
                    _this.setter(value);
                    wo.notify();
                },
                get: function () {
                    return _this.getter();
                },
                configurable: true,
                enumerable: true
            };
            defineProp(proxyObj, this._$name, propConfig);
        },
        setter: function (value) {
           this._$value = value;
        },
        getter: function () {
            return this._$value;
        },
        generate: _noop
    });

    function _generateArray(proxyObj, array) {
        each(array, function (item, i) {
            if(isPlainObject(item)){
                _generateObj(proxyObj[i] = {}, item);
            } else if(isArray(item)){
                _generateArray(proxyObj[i] = [], item);
            } else {
                proxyObj[i] = item;
            }
        });
    }

    function _generateObj(proxyObj, obj){
        each(obj, function (val, name) {
            new PO(name, val).generate(proxyObj);
        });
    }

    function _parseExpForValue(obj, exp) {
        if (!obj || !exp) {
            return;
        }
        var parts = exp.split('.'),
            i = 0,
            len = parts.length;
        for (; i < len; i++) {
            obj = obj[parts[i]];
            if (!obj) {
                break;
            }
        }
        return obj;
    }

    function _equal(a, b) {
        //array object null undefined string number bool function
        if(typeof a !== typeof b){
            return false;
        } else if(isArray(a)){
            if(a.length !== a.length){
                return false;
            } else {
                return _objEqual(a, b);
            }
        } else if(isPlainObject(a)){
            return _objEqual(a, b);
        } else {
            return a+'' === b+'';
        }
    }

    function _objEqual(a, b){
        for(var k in a){
            if(!_equal(a[k], b[k])){
                return false;
            }
        }
        return true;
    }

    return Watcher;
}));
