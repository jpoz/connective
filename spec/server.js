var util = require('util');
var express = require('express');

var app = express.createServer();
app.configure(function(){
    app.use(express.logger());
    // app.use(express.bodyDecoder());
    
    app.use(app.router);
    
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    app.use(express.methodOverride());
});


app.get('/long_poll_for/:timeout.js', function(req, res) {
  setTimeout(function() {
    res.send(req.query.jsonp + "(true);");
  }, req.params.timeout);
});

app.get('/echo_params.js', function(req, res) {
  res.send(req.query.jsonp + "("+JSON.stringify(req.query)+");");  
});

app.get('/failing_callback.js', function(req, res) {
  res.send("fail_boat();");
});

// BOOOM
app.listen(4000);
util.log('Running Test Server');

