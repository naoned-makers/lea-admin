"use strict";

let http = require('http');
let express = require('express');
let app = express();
let server = http.createServer(app);
let ip = require("ip");
let path = require('path');
let pm2GUI = require('pm2-gui');
let pm2 = require('pm2');
var bonjour = require('bonjour')();
const {
  spawn
} = require('child_process');


const ADMIN_HTTP_PORT = 8081;

pm2.connect(false, function (err) {
  if (err) {
    //console.error(err);
    //process.exit(2);
  }
  console.log("pm2 connected");


});

process.on('SIGINT', function () {
  pm2.disconnect();
  console.log('stop')
});

//#########################
//for serving html files
//#########################
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public/assets')));
app.get('/', function (req, res, next) {
  res.render('admin', getServices());
});
app.get('/simulator', function (req, res, next) {
  res.render('simulator', getServices());
});
app.get('/services', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(getServices()));
});
app.get('/halt', function (req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('Halt asked');
  const halt = spawn('halt');
  halt.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  halt.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
});
app.get('/restart', function (req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('Restart ALL');
  pm2.list((err, plist) => {
    plist.sort(function (a, b) {
      return a.name == 'admin' ? 1 : 0
    }).map((service) =>
      pm2.restart(service.name, (err, process) => {
        console.error(err, process)
      })
    );
  });
});
app.get('/init3', function (req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('telinit 3 asked');
  const telinit = spawn('telinit 3'); //'ls', ['-lh', '/usr']
  telinit.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  telinit.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
});


server.listen(ADMIN_HTTP_PORT);
console.log('\x1b[35m%s\x1b[0m', "admin web server is up on http://" + ip.address() + ":" + ADMIN_HTTP_PORT);
bonjour.publish({
  name: 'imadmin',
  type: 'http',
  subtypes: ["im", "admin"],
  port: ADMIN_HTTP_PORT,
  txt: {
    subtypes: ["im", "admin"]
  }
});

var browser = bonjour.find();
browser.on("up", (service) => {
  //console.log('up service:', service)
});
browser.on("down", (service) => {
  //console.log('down service:', service)
});
//discoverService('googlecast');

function getServices() {
  let imServices = {};
  browser.services
    .filter((service) => service.name.indexOf('im') == 0)
    .map((service) => {
      let ipV4address = (service.addresses[1] && service.addresses[1].length < service.addresses[0].length) ? service.addresses[1] : service.addresses[0];
      if (!ipV4address) {
        ipV4address = service.referer.address;
      }
      imServices[service.name] = {
        address: ipV4address,
        host: service.host,
        port: service.port,
        type: service.type,
        txtRecord: service.txt
      };
    });
  return imServices;
}


//##############################################################################
//#########################   PM2 GUI        ###################################
//##############################################################################
console.log("pm2-gui starting");
bonjour.publish({
  name: 'impm2gui',
  type: 'http',
  subtypes: ["im", "pm2gui"],
  port: 8088,
  txt: {
    subtypes: ["im", "pm2gui"]
  }
});
pm2GUI.startWebServer('./pm2-gui.ini');//port 8088
//pm2GUI.startAgent('./pm2-gui.ini');
//pm2GUI.dashboard('./pm2-gui.ini');
console.log("pm2-gui started");
//##############################################################################