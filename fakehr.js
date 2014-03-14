(function(){
  // Extends FakeXMLHttpRequest to register each new
  // request with fakehr
  function FakeRequest(){
    FakeXMLHttpRequest.call(this);
    fakehr.addRequest(this);
  }
  FakeRequest.prototype = FakeXMLHttpRequest.prototype;

  // reference the native XMLHttpRequest object so
  // it can be restored later
  var nativeRequest = window.XMLHttpRequest;

  function Handler(method, url, readyState, requestBody){
    if (readyState === undefined) { readyState = 1;}

    this.url          = url;
    this.method       = method;
    this.readyState   = readyState;
    this.requestBody  = requestBody;
    this.hasResponded = false;
  }

  Handler.prototype.respondTo = function(request) {
    this.hasResponded = true;
    request.respond.apply(request, this.response);
  };

  Handler.prototype.respond = function() {
    this.response = Array.prototype.slice.call(arguments, 0);
  };

  Handler.prototype.toString = function() {
    return JSON.stringify({url: this.url, method: this.method, readyState: this.readyState, requestBody: this.requestBody});
  };

  function match(handler, request){
    return (
      request.method && (request.method.toLowerCase() === handler.method.toLowerCase()) &&
      request.url && (request.url === handler.url) &&
      request.readyState === handler.readyState &&
      (!handler.requestBody || (request.requestBody && request.requestBody === handler.requestBody))
    );
  }

  function matchInHandlers(handlers, request){
    for (var i=0;i<handlers.length;i++) {
      if (match(handlers[i], request)) {
        return handlers[i];
      }
    }
    return false;
  }

  var fakehr = {
    handleRequest: function(request){
      var handler = matchInHandlers(this.expectations, request);
      if (!handler) handler = matchInHandlers(this.stubs, request);

      if (handler) {
        handler.respondTo(request);
        return true;
      }
      return false;
    },
    addRequest: function(request){
      if (!this.handleRequest(request)) {
        this.requests.push(request);
        request.onSend = function(){
          if (fakehr.handleRequest(request)) {
            request.onSend = null;
            for (var i=0;i<fakehr.requests.length;i++) {
              if (fakehr.requests[i] === request) { fakehr.requests.splice(i,1); }
            }
          }
        };
      }
    },
    start: function(){
      this.stubs        = this.stubs || [];
      this.requests     = this.requests || [];
      this.expectations = this.expectations || [];

      window.XMLHttpRequest = FakeRequest;
    },
    stop: function(){
      window.XMLHttpRequest = nativeRequest;
    },
    clear: function(){
      // removes the objects from the original array
      // just in case someone is referencing it.
      // the removed requests will never get a response.
      while (this.requests.length > 0) {
        this.requests.pop();
      }
      while (this.stubs.length > 0) {
        this.stubs.pop();
      }
      if (this.expectations.length > 0) {
        var expectationDescription;
        while (this.expectations.length > 0) {
          var expectation = this.expectations.pop();
          if (!expectation.hasResponded) expectationDescription = expectation.toString();
        }
        // Only throw after clear has cleared.
        if (expectationDescription) {
          throw new Error("fakehr expected a request for "+expectationDescription);
        }
      }
    },
    reset: function(){
      this.stop();
      this.clear();
    },

    /**
     * Stubs the described request.
     * @param method
     * @param url
     * @param readyState
     * @param requestBody The request body for advanced comparison (useful for POST requests with the same url).
     * @returns {Object} a handler object the can setup `respond` calls.
     */
    stub: function(method, url, readyState, requestBody) {
      var handler = new Handler(method, url, readyState, requestBody);
      this.stubs.push(handler);
      return handler;
    },

    /**
     * Expects the described request.
     * @param method
     * @param url
     * @param readyState
     * @param requestBody The request body for advanced comparison (useful for POST requests with the same url).
     * @returns {Object} a handler object the can setup `respond` calls.
     */
    expect: function(method, url, readyState, requestBody) {
      var handler = new Handler(method, url, readyState, requestBody);
      this.expectations.push(handler);
      return handler;
    },

    /**
     * Matches the given request with mocked.
     * @param method
     * @param url
     * @param readyState
     * @param requestBody The request body for advanced comparison (useful for POST requests with the same url).
     * @returns {Object} the matched request if found or undefined.
     */
    match: function(method, url, readyState, requestBody){
      var handler = new Handler(method, url, readyState, requestBody);

      for (var i = this.requests.length - 1; i >= 0; i--) {
        if (match(handler, this.requests[i])) {
          return this.requests[i];
        }
      }

      throw new Error("fakehr could not match an existing request for "+handler.toString());
    }
  }

  window.fakehr = fakehr;
})();
