// Load modules

var Bossy = require('bossy');
var Commander = require('./commander');
var Serial = require('./serial');


// Declare internals

var internals = {};


exports.run = function () {

    var settings = internals.options();

    var commander = new Commander(settings.url);
    var serial = new Serial({ portname: settings.portname });
    serial.start(function (err) {

        if (err) {
            console.error(err);
            process.exit(1);
        }
    });

    serial.on('error', internals.handleError);
    commander.on('error', internals.handleError);

    serial.on('sensor', commander.report);

    commander.on('command', function (command) {

        serial.write(command, function (err, result) {

            if (err) {
                internals.handleError(err);
            }
            else {
                console.log(result);
            }
        });
    });
};


internals.handleError = function (err) {

    console.error(err);
};


internals.options = function () {

    var definition = {
        portname: {
            alias: 'p',
            type: 'string',
            description: 'specify serial port name to use, defaults to /dev/tty-usbserial1',
            default: '/dev/tty-usbserial1'
        },
        url: {
            alias: 'u',
            type: 'string',
            description: 'URL to send data to',
            required: true
        },
        help: {
            alias: 'h',
            type: 'boolean',
            description: 'display usage options'
        }
    };

    var argv = Bossy.parse(definition);

    if (argv instanceof Error) {
        console.error(Bossy.usage(definition, 'jenny [options]'));
        console.error('\n' + argv.message);
        process.exit(1);
    }

    if (argv.help) {
        console.log(Bossy.usage(definition, 'jenny [options]'));
        process.exit(0);
    }

    return {
        portname: argv.portname,
        url: argv.url
    };
};