//  db
var db = require('./db');

//  list all users
exports.getAllUsers = function(req,res,next) {
    
    //handle if non-admin logs in
    if(req.session.user.username!='admin') {
        return next();
        return;
    }
    
    db.getMongoConnection(function(err,collection){
        collection.find().toArray(function(err, items) {
            res.render(__dirname + '/views/admin.ejs',{
                username:req.session.user.username,
                data:items
            });
        });
    });
}

//  list details of user
exports.getUser = function(req,res,next) {
    
    //handle if non-admin logs in
    if(req.session.user.username!='admin') {
        return next();
        return;
    }
    
    var id = req.params.userid;
    db.getMongoConnection(function(err,collection){
        collection.findOne({'_id':new db.bson.ObjectID(id)},function(err, item) {
            res.send(item)
        });
    });
    
}

//  add new user
exports.addUser = function(req,res,next) {
    var user = req.body;
    db.getMongoConnection(function(err,collection){
        collection.insert(user,{safe:true},function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                //console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

//  edit existing user
exports.editUser = function(req,res,next) {
    var id = req.params.userid;
    var user = req.body;
        
    db.getMongoConnection(function(err,collection){
        collection.update({'_id':new db.bson.ObjectID(id)},user, {safe:true}, function(err, result) {
            if (err) {
                //console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                //console.log('' + result + ' document(s) updated');
                res.send(user);
            }
        });
    });
}

//  delete an existing user
exports.deleteUser = function(req,res,next) {
    var id = req.params.userid;
    db.getMongoConnection(function(err,collection) {
        collection.remove({'_id':new db.bson.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                //console.log('' + result + ' document(s) deleted');
                res.send({status:'success',id:id});
            }
        });
    });
}