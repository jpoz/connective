describe("Connective", function() {
  
  describe("get", function() {
    
    it('should preform a get and call the callback', function() {
      var returned_value = false;
      Connective.get('http://localhost:4000/long_poll_for/100.js', {}, function(json) {
        returned_value = json;
      });
      
      waitsFor(function() {
        return returned_value;
      }, "get never preformed get", 1000);
    });
    
  });
  
  describe("connectTo", function() {
    
    it('should preform a get and call the callback', function() {
      var returned_value = false;
      var connection     = Connective.connectTo('http://localhost:4000/long_poll_for/2000.js', {}, function(json) {
        returned_value = json;
      });
      
      waitsFor(function() {
        return returned_value;
      }, "connectTo never preformed get", 3000);
      
      runs(function() {
        connection.kill();
      });
    });
    
    it('should allow the manipulation of the params sent to the server', function() {
      var returned_value = false;
      var connection     = Connective.connectTo('http://localhost:4000/echo_params.js', {change_me: false}, function(json) {
        returned_value = json.change_me;
        this.params.change_me = true;
      });
      
      waitsFor(function() {
        return returned_value;
      }, "connectTo never changed the params", 3000);
      
      runs(function() {
        connection.kill();
      });
    });
    
    describe("kill()", function() {
      
      it('should kill the connection', function() {
        var kill_called = false;
        var request_should_of_completed = false;
        var returned_value = false;
        
        var connection   = Connective.connectTo('http://localhost:4000/long_poll_for/1000.js', {}, function(json) {
          returned_value = json;
        });
        
        setTimeout(function() {
          connection.kill();
          kill_called = true;
        }, 100);
        
        setTimeout(function() {
          request_should_of_completed = true;
        }, 1500);

        waitsFor(function() {
          return kill_called;
        }, "kill was never called", 500);
        
        waitsFor(function() {
          return request_should_of_completed;
        }, "request_should_of_completed never preformed get", 3000);
        
        runs(function() {
          expect(returned_value).toBeFalsy();
        });
      });
      
    });
    
  });
  
  
  
});
