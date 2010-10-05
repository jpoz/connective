#!/usr/bin/env node

var http = require('http'),
    port = process.env.PORT || 3000
    url_parse = require('url').parse
    sys = require('sys');
    
var value    = "Type into the box below! Open multiple window";
var revision = -1 


http.createServer(function (req, res) {
  var query = url_parse(req.url, true).query;
  if (query) {
    sys.puts(sys.inspect(query));
    if(query.update) {
      value = query.update;
      ++revision;
      res.writeHead(200, {'Content-Type':'text/javascript'});
      res.end(query.jsonp+"();");
    } else if(query.jsonp) {
      new CometConnection(res, query, function() {
        return this.query.revision != revision;
      },function() {
        return {value: value, revision: revision};
      });
    } else {
      res.writeHead(200); res.end();
    }
  } else {
    res.writeHead(200); res.end();
  }
}).listen(parseInt(port));


function CometConnection(res, query, check, return_value) {
  this.jsonp = query.jsonp;
  this.query = query
  this.res = res;
  this.check = check;
  this.return_value = return_value;
  this.previous_value = this.check();
  this.start_check(150);
  this.start_fail_safe(30000); // if deploying on heroku this is needed
  return this;
}

CometConnection.prototype.respond = function(obj) {
  this.respond_with(this.return_value.call(this));
}

CometConnection.prototype.respond_with = function(obj) {
  clearTimeout(this.fail_safe);
  clearInterval(this.check_interval);
  this.res.writeHead(200, {'Content-Type':'text/javascript'});
  this.res.end(this.jsonp+"(" + JSON.stringify(obj) + ");");
  sys.puts("RESPOND: " +this.jsonp+"(" + JSON.stringify(obj) + ");")
} 

CometConnection.prototype.start_check = function(interval) {
  var self = this;
  this.check_interval = setInterval(function() { self.preform_check.call(self); }, interval);
}

CometConnection.prototype.preform_check = function() {
  if (this.check()) {
    this.respond()
  }
}

CometConnection.prototype.start_fail_safe = function(timeout) {
  var self = this;
  this.fail_safe = setTimeout(function() { self.respond(); }, timeout);
}