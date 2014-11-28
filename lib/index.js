// Load modules

var Events = require('events');
var Hoek = require('hoek');
var Wreck = require('wreck');


// Declare internals

var internals = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};


module.exports = internals.Commander = function (/* [url] */) {

    Hoek.assert(this.constructor === internals.Commander, 'must be constructed with new');

    var url = arguments[0]?arguments[0]:null;

    if(url) {
        Hoek.assert(url, 'URL parameter is required');
    }

    Events.EventEmitter.call(this);

    this._url = url;
    this._poll();
};

Hoek.inherits(internals.Commander, Events.EventEmitter);


internals.Commander.prototype.registerRadio = function (callback) {
    if(this._url !== null){
        Wreck.post(this._url + '/radio', { headers: internals.headers }, function (err, res, payload) {

        if (err) {
            return callback(err);
        }

            return callback(null, payload.id || payload.radioId);
        });    
    }

    else{

        console.log('Shouldnot see this one - registering. Pshh');
    }
    
};


internals.Commander.prototype.updateRadio = function (radioId, data, callback) {

    var stringified = JSON.stringify(data);
    if (this._url !== null) {
        Wreck.put(this._url + '/radio/' + radioId, { payload: stringified, headers: internals.headers }, function (err, res, payload) {

            if (err) {
                return callback(err);
            }

            return callback(null, payload);
        });
    }

    else {
        console.log('Radio ' + radioId + ' Update: ' + stringified);
    }
};


internals.Commander.prototype.updateSensor = function (radioId, sensorId, data, callback) {

    var stringified = JSON.stringify(data);
    if (this._url !== null) {
        Wreck.put(this._url + '/radio/' + radioId + '/sensor/' + sensorId, { payload: stringified, headers: internals.headers }, function (err, res, payload) {

            if (err) {
                return callback(err);
            }

            return callback(null, payload);
        });
    }

    else {
        console.log('Radio ' + radioId + ': Update Sensor: ' + sensorId + ': ' + stringified);
    }
};


internals.Commander.prototype.createReading = function (radioId, sensorId, data, callback) {

    var stringified = JSON.stringify(data);
    if (this._url !== null) {
        Wreck.post(this._url + '/radio/' + radioId + '/sensor/' + sensorId + '/reading', { payload: stringified, headers: internals.headers }, function (err, res, payload) {

            if (err) {
                return callback(err);
            }

            return callback(null, payload);
        });
    }

    else {
        console.log('Radio ' + radioId + ': Sensor reading: ' + sensorId + ': ' + stringified);
    }
};


internals.Commander.prototype.log = function (message, callback) {

    var stringified = JSON.stringify(message);
    if (this._url !== null) {
        Wreck.post(this._url + '/log', { payload: stringified, headers: internals.headers }, function (err, res, payload) {

            if (err) {
                return callback(err);
            }

            return callback(null, payload);
        });
    }

    else {
        console.log('Log: ' + stringified);
    }
};


internals.Commander.prototype._checkForCommand = function (callback) {

    if (this._url !== null) {
        Wreck.get(this._url + '/command', { headers: internals.headers }, function (err, res, payload) {

            if (err) {
                return callback(err);
            }

            if (res.statusCode !== 200) {
                return callback();
            }

            var command = payload;
            if (payload && typeof payload === 'string') {
                try {
                    command = JSON.parse(payload);
                }
                catch (err) {
                    return callback();
                }
            }

            if (command instanceof Error) {
                return callback(command);
            }

            return callback(null, (!command || command.length === 0) ? null : command);
        });
    }

    else {
        console.log('In console mode - no commands available.');
    }
};


internals.Commander.prototype._poll = function () {

    var self = this;

    setTimeout(function () {

        self._checkForCommand(function (err, command) {

            if (err) {
                self.emit('error', err);
            }
            else if (command && Object.keys(command).length) {
                self.emit('command', command);
            }

            self._poll();
        });
    }, 30);
};