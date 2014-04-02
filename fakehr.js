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

  var fakehr = {
    addRequest: function(r){
      this.requests.push(r);
    },
    start: function(){
      this.requests = this.requests ||[];
      window.XMLHttpRequest = FakeRequest;
    },
    stop: function(){
      window.XMLHttpRequest = nativeRequest;
    },
    clear: function(){
      var requests = this.requests;
      // removes the objects from the original array
      // just in case someone is referencing it.
      // the removed requests will never get a response.
      while (requests.length > 0) {
        requests.pop();
      }
    },
    reset: function(){
      this.stop();
      this.clear();
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
      if (readyState === undefined) { readyState = 1;}

      var requests = this.requests;
      for (var i = requests.length - 1; i >= 0; i--) {
        var request = requests[i];

        if (request.readyState !== readyState) continue;

        if (request.method.toLowerCase() !== method.toLowerCase()) continue;

        if (request.url !== url) continue;

        if (requestBody && request.requestBody !== requestBody) continue;

        return request;
      }
    }
  };

  window.fakehr = fakehr;
})();
