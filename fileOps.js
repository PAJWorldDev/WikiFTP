//  db
var db = require('./db');

//required libraries
var fs = require('fs'),
    fstream = require('fstream'),
    tar = require('tar'),
    zlib = require('zlib'),
    unzip = require('unzip'),
    tar = require('tar'),
    path = require('path'),
    mv = require('mv'),
    url = require('url')

//  function for traversing through filesystem
var walk = function(path) {
    var files = [], folders = [], list;
    try {
        list = fs.readdirSync(path)
        list.forEach(function(file) {
            file = path + '/' + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) {
                //results = results.concat(walk(file));
                file = file.split('/').pop(-1)
                files.push({
                    name:file,
                    mtime:stat.mtime.getTime(),
                    type:'dir'
                })
            } else {
                file = file.split('/').pop(-1)
                folders.push({
                    name:file,
                    mtime:stat.mtime.getTime(),
                    type:'file'
                })
            }
        });
    } catch(e) {
        return {
            errorcode:e.code
        };
    }
    return {
        status:'success',
        list:files.concat(folders)
    };
}

//  favicon requests
exports.favicon = function(req,res) {
    res.writeHead(200, {'Content-Type': 'image/x-icon'})
    res.end()
    return
}

//  return file list of a directory
exports.getList = function(req,res) {
    
    //  handle if admin
    if(req.session.user.username=='admin') {
        res.redirect('/admin');
        return;
    }
    
    var aliases;
    db.getMongoConnection(function(err,collection){
        collection.findOne({username:req.session.user.username}, function(err, item) {
            
            if(item==null) {
                res.redirect('/logout');
                return;
            }
            
            aliases = item.aliases;
            
            /* prepare aliases into desired format */
            var temp = {};
            for(i in aliases)
                temp[aliases[i].name]=aliases[i].path
            aliases = temp;
            req.session.user.aliases = aliases;
            //============================== code
            res.header('Content-Type','application/json');
            
            var segments = req.url.split('/')
            segments.shift()
                
            var alias = req.params.alias
            
            var isValidAlias = false
            if(!aliases[alias])
                isValidAlias = false
            else
                isValidAlias = true
            
            if(req.xhr) {
                
                if(segments[0].trim()=='home' && segments.length==1) {
                    var list = [];
                    for(i in aliaslist=Object.keys(aliases)) {
                        list.push({
                            name:aliaslist[i],
                            type:'alias'
                        });
                    }
                    res.send({
                        status: 'success',
                        type:'aliases',
                        list: list
                    });
                    return;
                }
                
                if(isValidAlias) {
                    var segments = req.url.split('/')
                    segments.shift()
                    segments.shift()
                    var path = '/' + segments.join('/')
                    segments.shift()
                    
                    var files = walk(aliases[alias] + '/' + decodeURIComponent(segments.join('/')))
                    
                    switch(files.errorcode) {
                        case 'ENOENT':
                            res.send({
                                status: 'failed',
                                reason:'invalid path'
                            })
                            break
                        case 'ENOTDIR':
                            res.send({
                                status: 'failed',
                                reason:'specified path is a file'
                            })
                            break
                        default:
                            res.send({
                                status: 'success',
                                type:'files',
                                list: files.list,
                                path:path
                            })
                    }
                    
                } else {
                    res.send({
                        status:'failed',
                        reason:'invalid alias'
                    });
                }
            } else {
                res.header('Content-Type','text/html')
                res.header('Cache-Control','no-cache, must-revalidate')
                res.render(__dirname + '/views/main.ejs',{
                    username: req.session.user.username
                })
            }
            //============================== code ends
        });
    });
}

//  download file/folder
exports.download = function(req, res, next) {    
    var aliases = req.session.user.aliases;
    
    var parts = req.url.split('/')
    parts.shift();parts.shift();parts.shift()
    var filepath = aliases[decodeURIComponent(parts[0])]
    parts.shift()
    filepath+='/'+parts.join('/')
    try {
        var stat = fs.statSync(decodeURIComponent(filepath))
    } catch(e) {
        //console.log(e.message)
        res.send(404)
        return
    }
    if(stat.isDirectory()) {
        res.writeHead(200, {
            'Content-Type'        : 'application/octet-stream',
            'Content-Disposition' : 'attachment; filename='+path.basename(filepath)+'.zip',
            'Content-Encoding'    : 'gzip'
        });
        fstream.Reader({ 'path' : decodeURIComponent(filepath), 'type' : 'Directory' })
            .pipe(tar.Pack())
            .pipe(zlib.Gzip())
            .pipe(res)
    } else res.download(filepath)
}

//  share folder to another user
exports.share = function(req,res){
    
    var aliases = req.session.user.aliases;
    var parts = url.parse(req.url).pathname.split('/');
    var toUser = req.query.toUser;
    var foldername = req.query.foldername;
    
    if(toUser=='admin') {
        res.send({status:'failed'});
        return;
    }
    
    parts.shift();parts.shift();parts.shift();
    var filepath = aliases[decodeURIComponent(parts[0])];
    parts.shift();
    filepath+='/'+parts.join('/');
    
    db.getMongoConnection(function(err,collection){
        collection.findOne({'username':toUser},function(err, item) {
            if(err) {
                res.send({status:'failed'});
            } else {
                if(item==null)
                    res.send({status:'success'});
                else {
                    var newalias = {
                            name:req.session.user.username+'_'+foldername,
                            path:decodeURIComponent(filepath)
                        }
                    if(item.aliases) {
                        item.aliases.push(newalias);
                    } else {
                        var aliases = []
                        aliases.push(newalias);
                        item['aliases']=aliases
                    }
                    
                    delete item._id;
                    collection.update({'username':toUser},item, {safe:true}, function(err, result) {
                        if (err) {
                            res.send({status:'failed'});
                        } else {
                            res.send({status:'success'});
                        }
                    });
                }
            }
        });
    });
}

//  delete file/folder
exports.delete = function(req,res) {
    
    var aliases = req.session.user.aliases;
    
    var parts = req.url.split('/')
    parts.shift();parts.shift();parts.shift()
    var filepath = aliases[parts[0]]
    parts.shift()
    filepath+='/'+parts.join('/')
    
    try {
        var stat = fs.statSync(decodeURIComponent(filepath))
    } catch(e) {
        //console.log(e.message)
        res.send(404)
        return
    }
    if(stat.isDirectory()) {
        deleteFolderRecursive(decodeURIComponent(filepath))
    } else {
        fs.unlinkSync(decodeURIComponent(filepath))
    }
    res.send({status:'success'})
}

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

//  upload file
exports.upload = function(req,res) {
    
    var aliases = req.session.user.aliases;    
    
    var thisFile = req.files.file;
    var parts = decodeURIComponent(req.body.folderLocation).split('/');
    parts.shift();parts.shift()
    var filepath = aliases[parts[0]];
    parts.shift();
    filepath+='/'+parts.join('/')+'/';
    
    mv(thisFile.path, decodeURIComponent(filepath+'/'+thisFile.originalFilename), {mkdirp: true}, function(err) {
        if(err)
            console.log(err);
        else
            res.redirect('back');
    });
}

//  unzip .zip files
exports.extract = function(req,res) {
    
    var aliases = req.session.user.aliases;
    
    var parts = decodeURIComponent(req.url).split('/');
    parts.shift();parts.shift();parts.shift();
    var filepath = aliases[parts[0]];
    parts.shift();
    filepath+='/'+parts.join('/');
    var folder = filepath.substring(0,filepath.lastIndexOf('.'));
    
    if(filepath.substring(filepath.lastIndexOf('.'),filepath.length)=='.zip') {
        fs.createReadStream(filepath).pipe(unzip.Extract({ path: folder }));
        res.send({status:'success',message:'Success',type:'success'});
        return;
    }
    /*if(filepath.substring(filepath.lastIndexOf('.'),filepath.length)=='.rar') {
        console.log('this')
        fs.createReadStream(filepath).pipe(tar.Extract({ path: folder }));
        res.send({status:'success',message:'Success',type:'success'});
        return;
    }*/
        
    res.send({status:'success',message:'<i class="fa fa-exclamation-circle"></i>&ensp;Only .zip files can be unzipped',type:'danger'});
    
}