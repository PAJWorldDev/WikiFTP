//  db
var db = require('./db');

//  render settings page
exports.settings = function(req,res) {
    res.render(__dirname + '/views/UserSettings.ejs',{
        username: req.session.user.username
    })
}

//  change passsword
exports.savesettings = function(req,res) {
    
    if(req.body.oldPassword != req.session.user.password) {
        res.send({status:'failed',reason:'Old password is incorrect'});
        return;
    }
    
    if(req.body.newPassword != req.body.confirmNewPassword) {
        res.send({status:'failed',reason:'Passwords do not match'});
        return;
    }
    
    var newPassword = req.body.newPassword;
    
    db.getMongoConnection(function(err,collection){
        var id = req.session.user._id;
        collection.update({'_id':new db.bson.ObjectID(id)},{$set:{'password':newPassword}}, {safe:true}, function(err, result) {
            if (err) {
                //console.log('Error updating user: ' + err);
                res.send({status:'failed','error':'Internal server error: Try again later.'});
            } else {
                //console.log('' + result + ' document(s) updated');
                req.session.user.password = newPassword;
                res.send({status:'success'});
            }
        });
    });
}