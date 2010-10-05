Connective = {
  get:function(url, params, callback) {
    var uuid = Connective._setup_uuid_callback();
    Connective._callback_store[uuid] = new ConnectiveGet(uuid, url, params, callback);
  },
  connectTo: function(url, params, callback) {
    var uuid = Connective._setup_uuid_callback();
    Connective._callback_store[uuid] = new ConnectiveConnection(uuid, url, params, callback);
  },
  
  // Private methods
  
  _setup_uuid_callback: function() {
    var uuid = Connective._uuid();
    Connective['receive_'+uuid] = new Function("json","Connective._callback_store["+uuid+"].receive(json)");
    return uuid;
  },
  _ping: function(uuid){
    Connective._callback_store[uuid].ping()
  },
  _receive: function(json, uuid) {
    Connective._callback_store[uuid].receive(json);
  },
  _timestamp: function() {
    return (new Date).valueOf();
  },
  _current_id: 0,
  _uuid: function() {
    return ++Connective._current_id;
  },
  _callback_store: { },
  _build_url_from: function(string, data) {
    string += (/\?/.test(string)) ? "&" : "?";
    var params = []
    for(var key in data) {
      params.push(key + "=" + data[key]);
    }
    string = string + params.join("&");
    return string;
  }
}

function ConnectiveConnection(uuid, url, params, callback) {
  this.uuid     = uuid;
  this.url      = url
  this.params   = params;
  this.callback = callback;
  this.connect();
  return this
}

ConnectiveConnection.prototype.receive = function(json) {
  this.callback(json);
}

ConnectiveConnection.prototype.ping = function() {
  document.getElementsByTagName('head')[0].removeChild(this.script);
  this.connect();
}

ConnectiveConnection.prototype.connect = function() {
  var current_base_url = (typeof(this.url) == 'function') ? this.url() : this.url;
  var current_url      = Connective._build_url_from(current_base_url, this.params)
  var connective_url   = Connective._build_url_from(current_url, {
    timestamp: Connective._timestamp(),
    jsonp : ("Connective.receive_"+this.uuid)
  });
  this.script = document.createElement('script');
  this.script.setAttribute('onload',"Connective._ping("+this.uuid+");");
  this.script.setAttribute('src', connective_url);
  document.getElementsByTagName('head')[0].appendChild(this.script);
}

function ConnectiveGet(uuid, url, params, callback) {
  this.uuid     = uuid;
  this.url      = url
  this.params   = params;
  this.callback = callback;
  this.connect();
  return this
}
ConnectiveGet.prototype.receive = ConnectiveConnection.prototype.receive;
ConnectiveGet.prototype.connect = ConnectiveConnection.prototype.connect;
ConnectiveGet.prototype.ping = function() {
  document.getElementsByTagName('head')[0].removeChild(this.script);
}