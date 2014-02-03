//Port number
var port_number = '80';

//Libraries
var express = require('express'),
    path = require('path'),
    http = require('http');

//Custom exports
var fileOps = require('./fileOps'),
    auth = require('./auth'),
    admin = require('./admin'),
    user = require('./UserSettings');
    
var app = express();

var store = new express.session.MemoryStore;

//Express configuration
app.configure(function () {
    app.set('port', process.env.PORT || port_number);
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'Anything', store:store }));
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/uploads' }));
    app.use(express.multipart());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.errorHandler());
    app.engine('html', require('ejs').renderFile);
});

//Authentication
app.get('/logout',auth.logout);
app.get('/login',auth.login);
app.post('/auth',auth.auth);
app.all('*', auth.checkSession);

//Admin
app.get('/admin',admin.getAllUsers);
app.get('/admin/:userid',admin.getUser);
app.post('/admin',admin.addUser);
app.put('/admin/:userid',admin.editUser);
app.delete('/admin/:userid',admin.deleteUser);

//Downloads
app.get('/download/*', fileOps.download);
app.get('/download', function(req,res){
    res.send(404);
});

//Upload
app.post('/upload*',fileOps.upload);

//Share
app.get('/share/*',fileOps.share);
app.get('/share',function(req,res){
    res.send(404);
});

//Extract archives
app.get('/extract/*',fileOps.extract);
app.get('/extract/*',function(req,res){
    res.send(404);
});

//Delete
app.get('/delete/*', fileOps.delete);
app.get('/delete', function(req,res){
    res.send(404);
});

//User account settings
app.get('/settings',user.settings);
app.post('/settings/save',user.savesettings);

//File Listing
app.get('/favicon.ico', fileOps.favicon);
app.get('/home/:alias/*', fileOps.getList);
app.get('/home/:alias', fileOps.getList);
app.get('/home/*', fileOps.getList);
app.get('/home', fileOps.getList);
app.get('*',function(req,res){res.redirect('/home')});

//Start server
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});