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

var imServices = {};

//#########################
//for serving html files
//#########################
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public/assets')));
app.get('/', function (req, res, next) {
  res.render('admin',imServices);
});
app.get('/simulator', function (req, res, next) {
  res.render('simulator',imServices);
});
app.get('/services', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(imServices));
});
server.listen(ADMIN_HTTP_PORT);
console.log('\x1b[35m%s\x1b[0m', "admin web server is up on http://" + ip.address() + ":" + ADMIN_HTTP_PORT);
let webAdminServiceType = mdns.makeServiceType({ name: 'im-admin', protocol: 'tcp' });
let adWebAdmin = mdns.createAdvertisement(webAdminServiceType, ADMIN_HTTP_PORT);
adWebAdmin.start();

discoverService('im-web');
discoverService('im-admin');
discoverService('im-broker');
discoverService('im-pm2');

console.log("pm2-gui starting");
let pm2GuiServiceType = mdns.makeServiceType({ name: 'im-pm2', protocol: 'tcp' });
let adPm2Gui = mdns.createAdvertisement(pm2GuiServiceType, 8088);
adPm2Gui.start();
pm2GUI.startWebServer('./pm2-gui.ini');//port 8088
//pm2GUI.startAgent('./pm2-gui.ini');
//pm2GUI.dashboard('./pm2-gui.ini');
console.log("pm2-gui started");

function discoverService(serviceName) {
  let sequence = [
    mdns.rst.DNSServiceResolve()
    , 'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }) //IPV4
    , mdns.rst.makeAddressesUnique()
  ];
  let browser = mdns.createBrowser(mdns.tcp(serviceName), { resolverSequence: sequence });
  browser.on('serviceUp', function (service) {
    //ignore vm interface and no im mdns
    if (service.networkInterface.indexOf('docker') > -1
      || service.networkInterface.indexOf('virb') > -1
      || service.type.name.indexOf('im') != 0
    ) return;
    // ignore duplicate ups
    if (imServices[service.type.name]) return;

    /*
  service up:  { interfaceIndex: 3,
    type:
     ServiceType {
       name: 'im-admin',
       protocol: 'tcp',
       subtypes: [],
       fullyQualified: true },
    replyDomain: 'local.',
    flags: 2,
    name: 'dbuntu',
    networkInterface: 'wlp1s0',
    fullname: 'dbuntu._im-admin._tcp.local.',
    host: 'dbuntu.local.',
    port: 8081,
    addresses: [ '192.168.122.1' ] }
    */
    imServices[service.type.name] = { addresses: service.addresses[0], host:  service.name, port: service.port, networkInterface: service.networkInterface, txtRecord: service.txtRecord };
    console.log("service up: ", service.type.name);
  });
  browser.on('serviceDown', function (service) {
    //ignore vm interface and no im service
    if (service.networkInterface.indexOf('docker') > -1
      || service.networkInterface.indexOf('virb') > -1
      || service.type.name.indexOf('im') != 0
    ) return;
    // ignore duplicate downs
    if (!imServices[service.type.name]) return;
    delete imServices[service.type.name];
    console.log("service down: ", service.type.name);
  });
  browser.start();
}