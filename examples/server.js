var http = require('http'),
    port = process.env.PORT || 3000
    url_parse = require('url').parse,
    
http.createServer(function (req, res) {
  var query = url_parse(req.url, true).query;
  if (query) {
    if(query.jsonp) {
      setTimeout(function() { 
        res.writeHead(200, {'Content-Type':'text/javascript'});
        res.end(query.jsonp+"(" + JSON.stringify({
          value: (new Date).valueOf()
        }) + ");");
      }, 3000);
    } else {
      res.writeHead(200); res.end();
    }
  } else {
    res.writeHead(200); res.end();
  }
}).listen(parseInt(port));