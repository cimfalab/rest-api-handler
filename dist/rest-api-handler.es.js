/**
 * Resolve given processor.
 *
 * @param {any} response - Response to process.
 * @param {Array<ProcessorAdapter>} list - Array of processors.
 * @param {number} i - Index of current processor.
 * @returns {any} Processed response
 */
function resolveArray(response, list) {
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var processor = list[i];

    if (!processor) {
        return response;
    }

    return (typeof processor === 'function' ? processor(response) : processor.processResponse(response)).then(function (processedResponse) {
        if (list[i + 1]) {
            return resolveArray(processedResponse, list, i + 1);
        }

        return processedResponse;
    });
}

// processor can be function or instance of class

var JSON_FORMAT = 'json';
var FORM_DATA_FORMAT = 'formdata';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var Api = function () {
    function Api(apiUrl) {
        var processors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var defaultHeaders = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var defaultOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        classCallCheck(this, Api);

        this.apiUrl = apiUrl;
        this.defaultHeaders = defaultHeaders;
        this.defaultOptions = defaultOptions;
        this.processors = processors;
    }

    /**
     * Convert data object to fetch format.
     *
     * @param {Object} data - data to convert
     * @param {Format} to - Format to which convert the data
     * @returns {string | FormData} converted data
     */


    createClass(Api, [{
        key: 'setDefaultHeaders',


        /**
         * Set default headers.
         *
         * @param {Headers} headers - http headers
         */
        value: function setDefaultHeaders(headers) {
            this.defaultHeaders = headers;
        }

        /**
         * Add default header for all requests.
         *
         * @param {string} name - name of header
         * @param {string} value - value for header
         */

    }, {
        key: 'setDefaultHeader',
        value: function setDefaultHeader(name, value) {
            this.defaultHeaders[name] = value;
        }

        /**
         * Default default header.
         *
         * @param {string} name - name of header
         */

    }, {
        key: 'removeDefaultHeader',
        value: function removeDefaultHeader(name) {
            delete this.defaultHeaders[name];
        }

        /**
         * Get default headers.
         *
         * @returns {Headers} - default headers for all requests
         */

    }, {
        key: 'getDefaultHeaders',
        value: function getDefaultHeaders() {
            return this.defaultHeaders;
        }

        /**
         * Request given API endpoint.
         *
         * @param {string} namespace - api endpoint
         * @param {MethodType} method - request method
         * @param {Object} options - fetch options
         * @param {Object} headers - custom headers
         * @returns {Promise<any>} processed response
         */

    }, {
        key: 'request',
        value: function request(namespace, method) {
            var _this = this;

            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            var fetched = fetch(new Request(this.apiUrl + '/' + namespace, _extends({}, this.defaultOptions, {
                method: method,
                headers: new Headers(_extends({}, this.getDefaultHeaders(), headers))
            }, options)));

            return fetched.then(function (response) {
                return resolveArray(response, _this.processors);
            });
        }

        /**
         * Send a GET request.
         *
         * @param {string} namespace - api endpoint
         * @param {Object} parameters - get parameters
         * @returns {Promise<any>} processed response
         */

    }, {
        key: 'get',
        value: function get$$1(namespace) {
            var parameters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.request('' + namespace + Api.convertParametersToUrl(parameters), 'GET');
        }

        /**
         * Send a POST request.
         *
         * @param {string} namespace - api endpoint
         * @param {Object} data - body JSON parameters
         * @param {?Format} format - format of body request
         * @returns {Promise<any>} processed response
         */

    }, {
        key: 'post',
        value: function post(namespace) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Api.FORMATS.JSON_FORMAT;

            return this.request(namespace, 'POST', {
                body: Api.convertData(data, format)
            });
        }

        /**
         * Send a PUT request.
         *
         * @param {string} namespace - api endpoint
         * @param {Object} data - body JSON parameters
         * @param {?Format} format - format of body request
         * @returns {Promise<any>} processed response
         */

    }, {
        key: 'put',
        value: function put(namespace) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Api.FORMATS.JSON_FORMAT;

            return this.request(namespace, 'PUT', {
                body: Api.convertData(data, format)
            });
        }

        /**
         * Send a DELETE request.
         *
         * @param {string} namespace - api endpoint
         * @returns {Promise<any>} processed response
         */

    }, {
        key: 'delete',
        value: function _delete(namespace) {
            return this.request(namespace, 'DELETE');
        }
    }], [{
        key: 'convertData',
        value: function convertData(data) {
            var to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Api.FORMATS.JSON_FORMAT;

            if (to === FORM_DATA_FORMAT) {
                var formData = new FormData();
                Object.keys(data).forEach(function (key) {
                    var value = data[key];
                    formData.append(key, typeof value === 'number' ? value.toString() : value);
                });
                return formData;
            }

            return JSON.stringify(data);
        }

        /**
         * Convert parameters to url parameters string.
         *
         * @param {Object} parameters - list of parameters
         * @returns {string} encoded string
         */

    }, {
        key: 'convertParametersToUrl',
        value: function convertParametersToUrl(parameters) {
            var keys = Object.keys(parameters);

            if (keys.length === 0) {
                return '';
            }

            return '?' + keys.map(function (key) {
                var value = parameters[key];
                return key + '=' + encodeURI(typeof value === 'number' ? value.toString() : value);
            }).join('&');
        }
    }]);
    return Api;
}();

Api.FORMATS = {
    JSON_FORMAT: JSON_FORMAT,
    FORM_DATA_FORMAT: FORM_DATA_FORMAT
};

/**
 * Decode API body response.
 *
 * @param {Response} response - Native response.
 * @returns {Object | string} Decoded json or simple string.
 */
function decodeResponse(response) {
    if (response.headers.get('content-type').indexOf('application/json') !== -1) {
        return response.json();
    }

    return response.text();
}

/**
 * Process response from API.
 *
 * @param {Response} response - Native response.
 * @returns {Promise<ProcessedResponse>} Processed response from API.
 */
var responseProcessor = (function (response) {
    return decodeResponse(response).then(function (decodedResponse) {
        // create custom response format
        var toRespond = {
            data: decodedResponse,
            status: response.status,
            source: response
        };

        // resolve promise on 2xx answer
        if (response.status >= 200 && response.status <= 299) {
            return toRespond;
        }

        // otherwise create an error
        throw toRespond;
    });
});

/**
 * Processor provider that process response from API and throw custom Exception.
 */
var DefaultResponseProcessor = function () {

    /**
     * Constructor.
     *
     * @param {any} Exception - Exception class that will be throwed if request fails.
     */
    function DefaultResponseProcessor(Exception) {
        classCallCheck(this, DefaultResponseProcessor);

        this.Exception = Exception;
        this.processResponse = this.processResponse.bind(this);
    }

    /**
     * Process response from API.
     *
     * @param {Response} response - Native fetch response
     * @returns {Promise<ProcessedResponse>} Processed response.
     */


    createClass(DefaultResponseProcessor, [{
        key: 'processResponse',
        value: function processResponse(response) {
            var _this = this;

            return responseProcessor(response).catch(function (exception) {
                if (exception.data && exception.status && exception.source) {
                    throw new _this.Exception(exception);
                }

                throw exception;
            });
        }
    }]);
    return DefaultResponseProcessor;
}();

/**
 * Default API Exception
 */
var DefaultApiException =

/**
 * Constructor.
 *
 * @param {ProcessedResponse} response - Processed response from server.
 */
function DefaultApiException(response) {
  classCallCheck(this, DefaultApiException);

  this.response = response;
};

export { JSON_FORMAT, FORM_DATA_FORMAT, Api, responseProcessor as defaultResponseProcessor, DefaultResponseProcessor, DefaultApiException };