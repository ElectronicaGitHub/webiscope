
var express = require('express');
// var routes = require('./routes');
var http = require('http');
var bodyParser = require('body-parser');
// var faye = require('faye');
var path = require('path');
var async = require('async');
// var io = require('socket.io')(http);

var app = express();
app.use(bodyParser());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

var server = http.createServer(app);
// var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.NODE_PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/send_data', function (req, res, next) {
	b = req.body;
	console.log(b);

	var send_data = [];

	async.each(b.data, function (id, next) {
		console.log(id);
		var d = getVideoData(id, function (income) {
			console.log('in next');
			send_data.push( { data : income, id : id } );
			next();
		});
		
	}, function (err) {
		console.log('finish send');
		res.json({
			data : send_data
		})
	})
})

var jsdom = require('jsdom');
var htmlparser = require('htmlparser');
var sys = require('sys');
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

function getVideoData(id, cb) {

	console.log('id', id);

	http.request({
	    hostname: "www.periscope.tv",
	    port: 80,
	    path: "/w/" + id,
	    method: 'GET'
	}, function(res) {
		    html="";
		    res.setEncoding('utf8');
		    res.on("data", function (chunk) { html += chunk; });
			res.on('end', function() { 
				// html = html.replace(/\n/g, '');
				cb(html);
				// var handler = new htmlparser.DefaultHandler(function (error, dom) {
				    // if (error)
				    	// console.log('error', error);
				    // else
				    	// console.log('dom', dom);
				// });
				// var parser = new htmlparser.Parser(handler);
				// parser.parseComplete(html);
				// var ch = handler.dom[1].children[0].children;
				// for (var i in ch) {

				// 	if (ch[i].attribs && ch[i].attribs.id == 'user-broadcasts') {
				// 		try {
				// 			var q = ch[i].attribs.content;

				// 			q = q.replace(/&#34;/g, '\"');
				// 			q = JSON.parse(q);

				// 			rr = q;
				// 			cb(rr);

				// 		} catch (err) {
				// 			cb({ err : err });
				// 		}
				// 	}
				// }
		    })
	    }).end();
}


// 2.3
// https://ps15.pubnub.com/subscribe/sub-c-642f220c-d70e-11e3-93e0-02ee2ddab7fe/IFGv1GCEUHfEMkQTbE2Pz4rRSqKDXKJR3xNrSqVXdEERqYHdbeQf0S1AtJIlrFDLY_9bY627bdXI4huNLji3eA%3D%3D%2CIFGv1GCEUHfEMkQTbE2Pz4rRSqKDXKJR3xNrSqVXdEERqYHdbeQf0S1AtJIlrFDLY_9bY627bdXI4huNLji3eA%3D%3D-pnpres/0/14519573725869526?uuid=d844c7ee-2d8f-4b94-8b5f-ed16764154d9&auth=W-FBK1nIAhw_aLlGPsaOsFSYoh-9UjF5sULLBHrbiXY%3D&pnsdk=PubNub-JS-Web%2F3.7.8&state=%7B%22IFGv1GCEUHfEMkQTbE2Pz4rRSqKDXKJR3xNrSqVXdEERqYHdbeQf0S1AtJIlrFDLY_9bY627bdXI4huNLji3eA%3D%3D%22%3A%7B%22platform%22%3A1%7D%7D&heartbeat=function%20error(message)%20%7B%20console%5B%27error%27%5D(message)%20%7D
// https://api.periscope.tv/api/v2/_getRankedFeedPublic?languages=en


server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
