//  MongoDB preferences
var host = 'localhost',
    port = 27017,
    database = 'wikiftp',
    collection = 'users';

//  database connection
var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var mongoCollection = null;

var getMongoConnection = function(readyCallback) {
    
    if(mongoCollection) {
        readyCallback(null, mongoCollection);
        return;
    }
    
    var server = new Server(host, port, {auto_reconnect: true});
    db = new Db(database, server ,{safe:false});
    
    db.open(function(err, db) {
        if(!err) {
            //console.log("Connected to 'wikiftp' database");
            db.collection(collection, {strict:true}, function(err, collection) {
                
                if(err) {
                    //console.log('The "users" collection doesn\'t exist. Populating it with data: {username:"admin",password:"admin"}');
                    mongoCollection = populateDB();
                } else {
                    mongoCollection = collection;
                }
                
                // now we have a connection
                readyCallback(err, mongoCollection);
            });
        }
    });
}

var populateDB = function() {
    var admin = {username:'admin',password:'admin'};
    var coll;
    db.collection(collection, function(err, collection) {
        coll = collection
        collection.insert(admin, {safe:true}, function(err, result) {});
    });
    return coll;
};

exports.getMongoConnection = getMongoConnection;
exports.bson = BSON;