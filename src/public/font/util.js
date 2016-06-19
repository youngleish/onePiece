define(function (require, exports, module) {
    var util = {};
    function search(str) {
        if (!str) {
            return {};
        }

        var ret = {};
        str = str.slice(1).split('&');
        for (var i = 0, arr; i < str.length; i++) {
            arr = str[i].split('=');
            ret[arr[0]] = arr[1];
        }
        return ret;
    }

    /**
     * 缓存函数
     * @param fn
     * @returns {Function}
     */
    util.memoize = function(fn) {
        var cache = {};
        return function () {
            var arg_str = JSON.stringify(arguments);
            cache[arg_str] = cache[arg_str] || fn.apply(fn, arguments);
            return cache[arg_str];
        };
    };

    /**
     * 发送 ajax 请求
     * @param {Object} api - 传入api参数
     * @param {Object} api.server - 请求服务器上下文
     * @param {Object} api.url - 发送请求地址
     * @param {Object} api.action - 请求动作 'GET' 或者 'POST'
     * @param {Object} [api.dataType=json] - 请求数据格式
     * @param params  请求参数
     * @param callback 请求成功回调函数
     * @param [callError]
     */
    util.sendRequest = function (api, params, callback, callError) {
        var server = api.server || '/api';
        var url = server + api.url;
        var _callError = callError || function () {
            };
        $.ajax({
            url: url,
            data: params,
            dataType: api.dataType || 'json',
            type: api.action || 'GET',
            success: callback,
            error: _callError,
            cache: false
        });
    };


    /**
     * 检查电话号码是否合法
     * @param str
     * @returns {boolean}
     */
    util.checkPhone = function (str) {
        var reg = /^(((13[0-9])|(15[0-9])|(17[0-9])|(18[0-9]))+\d{8})$/;
        return reg.test(str.trim());
    };

    /**
     * 检测客户端类型
     */
    util.device = (function () {
        var ua = navigator.userAgent.toLowerCase(),
            isIOS = !!(/(iphone|ipad|ipod|ios)/.test(ua)),
            isAndroid = !!(/(android)/.test(ua)),
            isPhone = isIOS || isAndroid,
            isWeixin = !!(/micromessenger/.test(ua)),
            isWeibo = !!(/weibo/.test(ua)),
            isQQBrowser = !!(/mqqbrowser/.test(ua)),
            isUC = !!(/ucbrowser/.test(ua)),
            isBaiduBrowser = !!(/baidubrowser/.test(ua)),
            isMogujie = !!(/mogujie/.test(ua)),

            // 客户端app UA(包括IOS，Android)
            isAm = !!(/amcustomer/.test(ua)),
            amVer = '',
            amSource = '',
            iosVer = '',

            // 手机上的chrome或者模拟chrome UA的终端
            isChrome = !!(/chrome/.test(ua)) && isPhone;
        if (isAm) {
            // 获取 ua 最后部分自行添加的字段
            var arrTmp = ua.split(' ');
            var agent = arrTmp[arrTmp.length - 1].split(';');
            amVer = agent[2];
            amSource = agent[4];
        }
        if (isIOS) {
            try {
                iosVer = ua.match(/os ((\d+_?){2,3})\s/)[1];
            } catch (e) {}
        }
        return  {
            'isIOS': isIOS,
            'isAndroid': isAndroid,
            'isWeixin': isWeixin,
            'isWeibo': isWeibo,
            'isPhone': isPhone,
            'isChrome': isChrome,
            'isQQBrowser': isQQBrowser,
            'isBaiduBrowser': isBaiduBrowser,
            'isMogujie': isMogujie,
            'isUC': isUC,
            'isAm': isAm,
            'amVer': amVer,
            'amSource': amSource,
            'iosVer': iosVer
        };
    }());

    /**
     * 解析 url 相关参数
     * @param {string} url - 传入的 url 参数
     * @returns {{protocol: (*|string|number), host: (*|string|String|string), hostname: (*|string), pathname: (*|string), search: ({}|*), hash: (*|string)}}
     */
    util.urlParser = util.memoize(function (url) {
        var a = document.createElement('a');
        a.href = url || window.location.href;
        return {
            origin: a.origin,
            protocol: a.protocol,
            host: a.host,
            hostname: a.hostname,
            pathname: a.pathname,
            search: search(a.search),
            hash: a.hash
        };
    });

    /**
     * 修改页面title
     * @param title
     * @param cb
     */
    util.setDocTitle = function (title, cb) {
        document.title = title;
        // hack在微信等webview中无法修改document.title的情况
        var $iframe = $('<iframe src="/favicon.ico" style="display:none;"></iframe>');
        $iframe.on('load',function() {
            setTimeout(function() {
                $iframe.off('load').remove();
            }, 0);
        }).appendTo($('body'));
        if ($.isFunction(cb)) {
            cb();
        }
    };

    /**
     * 图片尺寸替换
     * @param img 图片
     * @param width 图片宽度
     * @param height 图片高度
     * @returns {*}
     */
    util.imgSizeReplace = function (img, width, height) {
        if (!width && !height) {
            return img;
        }
        // 宽高相同则可传一个参数
        var _height = height ? height : width;
        return img.replace(/(\.png|\.jpg|\.jpeg)/i, '_' + width + 'x' + _height + '$1');
    };

    /**
     * 前缀补0
     * @param n
     * @returns {*}
     */
    util.prefixZero = function(n) {
        if (typeof n !== 'number') {
            return n;
        }
        var num = parseInt(n, 10);
        if (num <= 9) {
            return '0' + num;
        } else {
            return '' + num;
        }
    };

    /**
     * 对象按照某字段值排序
     * @param key 排序字段
     * @returns {Function}
     */
    util.objectSortByKey = function (key) {
        return function (o, p) {
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[key];
                b = p[key];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? 1 : -1;
                }
                return typeof a < typeof b ? 1 : -1;
            }
        };
    };

    /**
     * 频率控制 返回函数连续调用时，func 执行频率限定为 次 / wait
     *
     * @param  {function}   func      传入函数
     * @param  {number}     wait      表示时间窗口的间隔
     * @param  {object}     options   如果想忽略开始边界上的调用，传入{leading: false}。
     *                                如果想忽略结尾边界上的调用，传入{trailing: false}
     * @return {function}             返回客户调用函数
     */
    util.throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) {
            options = {};
        }
        var later = function() {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };

        return function() {
            var now = Date.now();
            // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
            if (!previous && options.leading === false) {
                previous = now;
            }
            // 延迟执行时间间隔
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
            // remaining大于时间窗口wait，表示客户端系统时间被调整过
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                //如果延迟执行不存在，且没有设定结尾边界不执行选项
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    /**
     * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
     *
     * @param  {function} func        传入函数
     * @param  {number}   wait        表示时间窗口的间隔
     * @param  {boolean}  immediate   设置为true时，调用触发于开始边界而不是结束边界
     * @return {function}             返回客户调用函数
     */

    util.debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            // 据上一次触发时间间隔
            var last = Date.now() - timestamp;

            // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
            if (last < wait && last > 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) {
                        context = args = null;
                    }
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = Date.now();

            var callNow = immediate && !timeout;
            // 如果延时不存在，重新设定延时
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
    };

    /**
     * 浏览器兼容性代码
     */
    function polyfill() {

        // String 的 trim 函数
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
        }

        // Function 的 bind 函数
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    F_NOP = function () {
                    },
                    fBound = function () {
                        return fToBind.apply(this instanceof F_NOP ? this : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                F_NOP.prototype = this.prototype;
                fBound.prototype = new F_NOP();

                return fBound;
            };
        }
    }

    polyfill();
    return util;
});