
"use strict";
let http = require('http');
let express = require('express');
let app = express();
let server = http.createServer(app);
let ip = require("ip");
let path = require('path');
let pm2GUI = require('pm2-gui');
let pm2 = require('pm2');
let mdns = require('mdns');

const ADMIN_HTTP_PORT = 8081;

pm2.connect(function (err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  console.log("pm2 connected");
  /*
  pm2.list((err, plist) => {
    console.log("pm2 list:", plist);
  });
*/
});


//#########################
//for serving html files
//#########################
app.use(express.static(path.join(__dirname + '/static/assets')));
app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/static/admin.html'));
});
app.get('/simulator', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/static/simulator.html'));
  console.log('\x1b[35m%s\x1b[0m', "admin web server is up on " + ip.address() + ":" + ADMIN_HTTP_PORT);
  
});
server.listen(ADMIN_HTTP_PORT);
console.log('\x1b[35m%s\x1b[0m', "admin web server is up on " + ip.address() + ":" + ADMIN_HTTP_PORT);

let adminServiceType = mdns.makeServiceType({ name: 'im-admin', protocol: 'tcp' });
let ad = mdns.createAdvertisement(adminServiceType, ADMIN_HTTP_PORT);
ad.start();

var sequence = [
  mdns.rst.DNSServiceResolve()
  , 'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }) //IPV4
  , mdns.rst.makeAddressesUnique()
];

var listOfOscDevices = {};

var browser = mdns.createBrowser(mdns.tcp('im-admin'), { resolverSequence: sequence });
browser.on('serviceUp', function (service) {
  //ignore vm interface and no im mdns
  if (service.networkInterface.indexOf('docker') > -1
    || service.networkInterface.indexOf('virb') > -1
    || service.type.name.indexOf('im') != 0
  ) return;
  // ignore duplicate ups
  if (listOfOscDevices[service.type.name]) return;
  listOfOscDevices[service.type.name] = { 'addresses': service.addresses, 'port': service.port };
  console.log("service up: ", service);
});
browser.on('serviceDown', function (service) {
  //ignore vm interface and no im service
  if (service.networkInterface.indexOf('docker') > -1
    || service.networkInterface.indexOf('virb') > -1
    || service.type.name.indexOf('im') != 0
  ) return;
  // ignore duplicate downs
  if (!listOfOscDevices[service.type.name]) return;
  console.log("service down: ", service);
});
browser.start();

console.log("pm2-gui starting");
pm2GUI.startWebServer('./pm2-gui.ini');//port 8088
//pm2GUI.startAgent('./pm2-gui.ini');
//pm2GUI.dashboard('./pm2-gui.ini');
console.log("pm2-gui started");