const express = require('express'),
    path = require('path'),
    config = require('./config/config.js'),
    knox= require('knox'),
    fs = require('fs'),
    os= require('os'),
    formidable = require('formidable'),
    gm = require('gm'),
    mongoose = require ('mongoose').connect(config.dbURL)
const app = express();
app.set('host', config.host);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
const knoxClient = knox.createClient({key:config.S3AccessKey,secret:config.S3Secret,
bucket:config.S3bucket})
var Socket;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
 io.on('connection',(socket)=>{
   Socket = socket
 })
require('./routes/routes.js')(express, app ,mongoose, formidable , fs, os,gm ,knoxClient ,Socket);




server.listen(app.get('port'), () => {
    console.log("PG running on " + app.get('port'))
})