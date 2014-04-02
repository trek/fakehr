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

test("2 post requests with the same url, yet different body", function() {
  var xhr = new XMLHttpRequest();
  xhr.open('post', '/a/path', true);
  xhr.send('First POST');

  var xhr2 = new XMLHttpRequest();
  xhr2.open('post', '/a/path', true);
  xhr2.send('Second POST');
  equal(fakehr.match('post', '/a/path', 1, 'First POST'), xhr);
  equal(fakehr.match('post', '/a/path', 1, 'Second POST'), xhr2);
});

test("matches URL and request body using a regular expression", function(){
  var xhr1 = new XMLHttpRequest();
  xhr1.open('get', '/a/path?param=value');

  equal(fakehr.match('get', /\/a\/path\?.*/), xhr1);
  ok(!fakehr.match('get', /bad\/path/));

  var xhr2 = new XMLHttpRequest();
  xhr2.open('post', '/a/path');
  xhr2.send('body');

  equal(fakehr.match('post', '/a/path', 1, /body/), xhr2);
  ok(!fakehr.match('get', '/a/path', 1, /bad body/));
});

test("matches URL and request body using a callback", function(){
  var url = '/a/path';
  var body = 'body';
  var xhr = new XMLHttpRequest();
  xhr.open('post', url);
  xhr.send(body);

  var makeCallback = function(matches, value) {
    return function(arg) {
      equal(value, arg);
      return matches;
    };
  };

  equal(fakehr.match('post', makeCallback(true, url), 1), xhr);
  equal(fakehr.match('post', url, 1, makeCallback(true, body)), xhr);
  ok(!fakehr.match('post', makeCallback(false, url)));
  ok(!fakehr.match('post', url, 1, makeCallback(false, body)));
});
