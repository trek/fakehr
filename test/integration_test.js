module("jQuery ajax", {
  setup: function(){
    fakehr.start();
  },
  teardown: function(){
    fakehr.reset();
  }
});

test("jQuery success", function() {
  var wasCalled = false;
  var bodyPassed = false;

  $.ajax({
    method: 'get',
    url: '/some/url',
    success: function(resp){
      wasCalled = true;
      bodyPassed = resp.bodyPassed;
    }
  });

  fakehr.match('get', '/some/url').respond(200, {"Content-Type":"application/json"}, '{"bodyPassed":true}');

  ok(wasCalled);
  ok(bodyPassed);
});

test("jQuery failure", function() {
  var wasCalled = false;
  var bodyPassed = false;

  $.ajax({
    method: 'get',
    url: '/some/url',
    error: function(xhr, errorType, statusText){
      wasCalled = true;
      equal(errorType, "error");
      equal(statusText, "Not Found");
      bodyPassed = JSON.parse(xhr.responseText).bodyPassed;
    }
  });

  fakehr.match('get', '/some/url').respond(404, {"Content-Type":"application/json"}, '{"bodyPassed":true}');

  ok(wasCalled);
  ok(bodyPassed);
});

test("stub response for jQuery success", function() {
  var wasCalled = false;
  var bodyPassed = false;

  fakehr.stub('get', '/some/url').respond(200, {"Content-Type":"application/json"}, '{"bodyPassed":true}');

  $.ajax({
    method: 'get',
    url: '/some/url',
    success: function(resp){
      wasCalled = true;
      bodyPassed = resp.bodyPassed;
    }
  });

  ok(wasCalled);
  ok(bodyPassed);
});

test("expect response for jQuery success", function() {
  var wasCalled = false;
  var bodyPassed = false;

  fakehr.expect('get', '/some/url').respond(200, {"Content-Type":"application/json"}, '{"bodyPassed":true}');

  $.ajax({
    method: 'get',
    url: '/some/url',
    success: function(resp){
      wasCalled = true;
      bodyPassed = resp.bodyPassed;
    }
  });

  ok(wasCalled);
  ok(bodyPassed);
});

test("expect response for jQuery success", function() {
  fakehr.expect('get', '/some/url').respond(200, {"Content-Type":"application/json"}, '{"bodyPassed":true}');

  var asserted = false;
  try {
    fakehr.reset();
  } catch (e) {
    if (e.message === 'fakehr expected a request for {"url":"/some/url","method":"get","readyState":1}') {
      asserted = true;
    }
  }

  ok(asserted, "Expected api call was not present and an error was thrown");
});
