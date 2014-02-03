//  db
var db = require('./db');

//  authenticate
exports.auth = function(req,res) {
    var usr = req.body.username;
    var pwd = req.body.password;
    
    db.getMongoConnection(function(err,collection){
        collection.findOne({username:usr,password:pwd}, function(err, item) {
            if(item!=null && usr==item.username && pwd==item.password) {
                req.session.user = item;
                if(req.session.user.username=='admin') {
                    res.redirect('/admin');
                    return;
                }
                res.redirect('/home');
            } else {
                res.render(__dirname + '/views/login.ejs',{
                    alerttype:'alert-danger',
                    message:'Incorrect username or password'
                });
            }
        });
    });
}

//  logout
exports.logout = function(req,res) {
    req.session.destroy();
    res.redirect('/');
}

//  login
exports.login = function(req,res) {
    res.render(__dirname + '/views/login.ejs',{
        alerttype:'alert-info',
        message:'Sign in to continue'
    });
}

//  check for an active session
exports.checkSession = function(req, res, next) {
    if(!req.session.user)
        res.redirect('/login');
    else
        return next();
}