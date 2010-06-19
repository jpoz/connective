Connective = {
  get:function(url, callback) {
    var uuid = Connective._setup_uuid_callback();
    Connective._callback_store[uuid] = new ConnectivePost(uuid, url, callback);
  },
  connectTo: function(url, callback) {
    var uuid = Connective._setup_uuid_callback();
    Connective._callback_store[uuid] = new ConnectiveConnection(uuid, url, callback);
  },
  
  // Private methods
  
  _setup_uuid_callback: function() {
    var uuid = Connective._uuid();
    Connective['receive_'+uuid] = new Function("json","Connective._callback_store["+uuid+"].receive(json)");
    return uuid;
  },
  _ping:function(uuid){
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
  _callback_store: { }
}

function ConnectiveConnection(uuid, url, callback) {
  this.uuid     = uuid;
  this.url      = url
  this.callback = callback
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
  this.script = document.createElement('script');
  this.script.setAttribute('onload',"Connective._ping("+this.uuid+");");
  this.script.setAttribute('src', this.url + "&ts="+Connective._timestamp()+"&jsonp=Connective.receive_"+this.uuid);
  document.getElementsByTagName('head')[0].appendChild(this.script);
}

function ConnectivePost(uuid, url, callback) {
  this.uuid     = uuid;
  this.url      = url
  this.callback = callback
  this.connect();
  return this
}
ConnectivePost.prototype = new ConnectiveConnection();
ConnectivePost.prototype.ping = function() {
  document.getElementsByTagName('head')[0].removeChild(this.script);
};