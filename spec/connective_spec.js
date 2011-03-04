describe("Connective", function() {
  
  describe("get", function() {
    
    it('should preform a get and call the callback', function() {
      var returned_value = false;
      Connective.get('http://localhost:4000/long_poll_for/100.js', {}, function(json) {
        returned_value = json;
      });
      
      waitsFor(function() {
        return returned_value;
      }, "get to return a value", 1000);
    });
    
    it('should add a cache busting attribute', function() {
      var returned_value = false;
      
      var connection = Connective.get('http://localhost:4000/echo_params.js', {change_me: false}, function(json) {
        returned_value = json.timestamp;
      });
      
      waitsFor(function() {
        return returned_value;
      }, "connectTo add timestamp", 3000);
      
      runs(function() {
        connection.kill(true);
      });
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
      }, "connectTo to preforme get", 3000);
      
      runs(function() {
        connection.kill(true);
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
      }, "connectTo change params", 3000);
      
      runs(function() {
        connection.kill(true);
      });
    });
    
    it('should not reconnect if it the connection does not complete', function() {
      var connection;
      
      window.fail_boat = function() {};
      
      runs(function() { 
        connection = Connective.connectTo('http://localhost:4000/failing_callback.js', {change_me: false}, function(json) {
          this.params.change_me = true;
        });
      });
      
      waits(500);
      
      runs(function() {
        expect(connection.script).toBeNull();
        connection.kill(true);
      });
    });
    
    it('should add a cache busting attribute', function() {
      var returned_value = false;
      var times_changed  = 0;
      
      var connection = Connective.connectTo('http://localhost:4000/echo_params.js', {change_me: false}, function(json) {
        returned_value = json.timestamp;
      });
      
      waitsFor(function() {
        return returned_value;
      }, "connectTo add timestamp", 3000);
      
      runs(function() {
        connection.kill(true);
      });
    });
    
    describe("kill()", function() {
        
        it('should kill the connection', function() {
          var kill_called = false;
          var request_should_of_completed = false;
          var returned_value = false;
          
          var connection;
          runs(function() {
            connection = Connective.connectTo('http://localhost:4000/long_poll_for/1000.js', {}, function(json) {
              returned_value = json;
            });
          
            setTimeout(function() {
              connection.kill(true);
              kill_called = true;
            }, 100);
          
            setTimeout(function() {
              request_should_of_completed = true;
            }, 1500);
          });
          
          waitsFor(function() {
            return kill_called || request_should_of_completed;
          }, "kill or request completion", 500);
          
          runs(function() {
            expect(kill_called).toBeTruthy();
            expect(returned_value).toBeFalsy();
            connection.kill(true);
          });
        });
        
      });
    
  });
  
  
  
});
