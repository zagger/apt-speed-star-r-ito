

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http');

var routes = require('./routes/index');
var api_route = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);
app.use('/api', api_route);

var server = http.createServer(app);
server.listen(process.env.PORT || '3000');




