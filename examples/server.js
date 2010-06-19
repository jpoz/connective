var http = require('http'),
    port = process.env.PORT || 3000
    url_parse = require('url').parse
    sys = require('sys');
    
var value    = "Awesome";
var revision = 0 


http.createServer(function (req, res) {
  var query = url_parse(req.url, true).query;
  if (query) {
    sys.puts(sys.inspect(query));
    if(query.update) {
      value = query.update
      res.writeHead(200, {'Content-Type':'text/javascript'});
      res.end(query.jsonp+"();");
    } else if(query.jsonp) {
      new CometConnection(res, query.jsonp, function() {
        return value;
      },function() {
        return {value: value};
      });
    } else {
      res.writeHead(200); res.end();
    }
  } else {
    res.writeHead(200); res.end();
  }
}).listen(parseInt(port));


function CometConnection(res, jsonp, check, return_value) {
  this.jsonp = jsonp;
  this.res = res;
  this.check = check;
  this.return_value = return_value;
  this.previous_value = this.check();
  this.start_check(150);
  this.start_fail_safe(30000);
  return this;
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
  this.check_interval = setInterval(function() { self.preform_check(); }, interval);
}

CometConnection.prototype.preform_check = function() {
  var current_value = this.check();
  if (this.previous_value != current_value) {
    this.respond_with(this.return_value());
  }
}

CometConnection.prototype.start_fail_safe = function(timeout) {
  var self = this;
  this.fail_safe = setTimeout(function() { self.respond_with(self.return_value()); }, timeout);
}