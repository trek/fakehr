module("match", {
  setup: function(){
    fakehr.start();
  },
  teardown: function(){
    fakehr.reset();
  }
});

test("matches open requests by HTTP method and url", function(){
  var xhr = new XMLHttpRequest();
  xhr.open('get', '/a/path');

  equal(fakehr.match('get', '/a/path'), xhr);
});

test("matches any requests by HTTP method, url, and readyState", function(){
  var xhr = new XMLHttpRequest();
  xhr.open('get', '/a/path');
  xhr.respond(200, {}, "OK");

  equal(fakehr.match('get', '/a/path', 4), xhr);
});

test("only returns first object found", function(){
  var xhr = new XMLHttpRequest();
  xhr.open('get', '/a/path');

  var xhr2 = new XMLHttpRequest();
  xhr2.open('get', '/another/path');

  equal(fakehr.match('get', '/a/path'), xhr);
});