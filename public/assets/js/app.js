var init = false;

$(document).ready(function () {
    
    function showAlert(message,type) {
        $('#alerts').html('<div class="alert alert-'+type+'">' +
                    '<button type="button" class="close" data-dismiss="alert">' +
                    '&times;</button>' + message + '</div>')
        .hide()
        .slideDown()
        .delay(5000)
        .slideUp();
    }
    
    var getJSONData = function(path) {
        var data = {};
        $.ajax({
            async:false,
            url:path,
            success: function(response) {
                data = response;
            }
        });
        if(!data.status) {
            window.location.href = '/login';
            return;
        }
        return data;
    }
    
    var updateContent = function(data) {
        if(data.status == 'success') {
            var buffer = '';
            
            for(i in data.list) {
                var obj = data.list[i];
                
                if(!data.path)
                    buffer += '<a href="'+window.location.origin+'/home'+'/'+obj.name+'" data-name="'+obj.name+'" data-item-type="'+obj.type+'" class="list-group-item link">' + '&ensp;';
                else
                    buffer += '<a href="'+window.location.origin+'/home'+data.path+'/'+obj.name+'" data-name="'+obj.name+'"  data-item-type="'+obj.type+'" class="list-group-item link">' + '&ensp;';
                
                if(obj.type == 'file')
                   buffer += '<span class="glyphicon glyphicon-file"></span>';
                if(obj.type == 'dir')
                   buffer += '<span class="glyphicon glyphicon-folder-open"></span>';
                if(obj.type == 'alias')
                   buffer += '<span class="glyphicon glyphicon-hdd"></span>';
                buffer += '&ensp;' + obj.name + '</a>';
            }
            $('#content').empty();
            $('#content').append(buffer);
            $('.link').on('click', function(event) {
                event.preventDefault();                
                var slash = window.location.href.charAt(window.location.href.length-1)=='/' ? '' : '/' ;
                var path = window.location.href+slash+event.target.getAttribute('href').split('/').pop();
                
                var loc = document.createElement('a');
                loc.href = path;
                
                if($(this).data('item-type')=='file') {
                    window.location.href = '/download'+loc.pathname;
                    return;
                }
                
                var data = getJSONData(path);
                updateContent(data);
                history.pushState(data, '', path);
            });
        } else {
            var loc = document.createElement('a');
            loc.href = window.location.href;
            var data = getJSONData(window.location.origin+'/home');
            history.replaceState(data, '', window.location.origin+'/home');
            updateContent(data);
            showAlert('<strong>Error: </strong>The folder \'' + loc.pathname + '\' does not exist.','danger');
        }
                
    }
    
    window.addEventListener('popstate', function(event) {
        /*if(event.state!=null)
            updateContent(event.state);*/
        
        var data = getJSONData(window.location.href);
        history.replaceState(data, document.title, document.location.href);
        updateContent(data);    
        
        //hide context menu if open
        $contextMenu.hide();
        
        $('#myModal').modal('hide')
        
    });
    
    if(!init) {
        var data = getJSONData(window.location.href);
        history.replaceState(data, document.title, document.location.href);
        init = true;
        updateContent(data);
    }
    
    
    /* context menu
    ==========================*/
    
    var $contextMenu = $('#contextMenu');
    var $rowClicked;

    $('body').on('contextmenu', 'a.link', function (e) {
        if($(this).data('item-type')=='alias')
            return true;
        $rowClicked = $(this);
        $contextMenu.css({
            display: 'block',
            left: e.pageX-50,
            top: e.pageY-85
        });
        return false;
    });

    $contextMenu.on('click', 'a', function () {
        var path = $rowClicked.attr('href')
        var action = $(this).data('action');
        var loc = document.createElement('a');
        loc.href = path;
        if('download'==action) {
            window.location.href = '/download'+loc.pathname;
        }
        if('delete'==action) {
            
            bootbox.confirm('Files will be permanently deleted. Are you sure?', function(result) {
                if(result) {
                    $.getJSON('/delete'+loc.pathname,function(response){
                        if('success'==response.status) {
                            $rowClicked.slideUp(500);
                            setTimeout(function(){
                                var data = getJSONData(window.location.href);
                                history.replaceState(data, document.title, document.location.href);
                                updateContent(data);
                            },500);
                        }
                    });
                }
            });
            
        }
        if('share'==action) {
            if($rowClicked.data('item-type')=='file') {
                showAlert('<i class="fa fa-exclamation-circle"></i>&ensp;You can only share a folder','danger')
                return;
            }
            
            var foldername = $rowClicked.data('name');
            bootbox.prompt('Enter the username you want to share this folder with:',function(result){
                if(result==null)return;
                $.getJSON('/share'+loc.pathname+'?toUser='+result+'&foldername='+foldername,function(response){
                    if(response.status=='success')
                        showAlert('Succesfully shared "'+foldername+'" with '+result,'info');
                    else
                        showAlert('Internal server error. Try again later.','danger');
                });
            })
        }
        if('unzip'==action) {
            if($rowClicked.data('item-type')!='file') {
                showAlert('<i class="fa fa-exclamation-circle"></i>&ensp;You can only unzip an archive','danger')
                return
            }
            $.getJSON('/extract'+loc.pathname,function(response){
                if(response.status=='success') {
                    showAlert(response.message,response.type);
                    var data = getJSONData(window.location.href);
                    history.replaceState(data, document.title, document.location.href);
                    updateContent(data);
                }
                else
                    showAlert('Internal server error. Try again later.','danger');
            });
        }
        $contextMenu.hide();
    });

    $(document).click(function(){
        $contextMenu.hide();
    });
    
    /* file uploads
    ==============================*/    
        
    var uploader = new plupload.Uploader({
        runtimes : 'html5',
         
        browse_button : 'pickfiles', // you can pass in id...
        container: document.getElementById('uploader'), // ... or DOM Element itself
         
        url : "/upload",
        
        /*
        filters : {
            max_file_size : '10mb',
            mime_types: [
                {title : "Image files", extensions : "jpg,gif,png"},
                {title : "Zip files", extensions : "zip"}
            ]
        },*/
     
        init: {
            PostInit: function() {
                document.getElementById('filelist').innerHTML = '<ul class="list-group" id="ul"></ul>';
     
                document.getElementById('uploadfiles').onclick = function() {
                    uploader.start();
                    return false;
                };
            },
     
            FilesAdded: function(up, files) {
                plupload.each(files, function(file) {
                    document.getElementById('filelist').innerHTML += '<li class="list-group-item" id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <span class="badge">Waiting...</span></li>';
                });
            },
            
            BeforeUpload: function(up,file) {
                var loc = document.createElement('a');
                loc.href = window.location.href;
                up.settings.multipart_params = {
                    'fileid':file.id,
                    'folderLocation':encodeURIComponent(loc.pathname)
                };
            },
     
            UploadProgress: function(up, file) {
                $('#'+file.id+' .badge').html(file.percent+'%');
                if(file.percent==100) {
                    $('#'+file.id+' .badge').html('<i class="fa fa-check"></i>');
                    $('#'+file.id+' .badge').addClass('badge-success')
                }
            },
     
            Error: function(up, err) {
                document.getElementById('console').innerHTML += "\nError #" + err.code + ": " + err.message;
            }
        }
    });
        
    
    uploader.init();
    
    /*  modal
    =================*/
    
    var openModal = function() {
        
        document.getElementById('filelist').innerHTML = '';
        
        var a = document.createElement('a');
        a.href = window.location.href;
        if(a.pathname.trim()=='/home')return
        
        $('#myModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    };
    
    $('#openModal').on('click',function(){
        openModal();
    });
    
    $('#myModal').on('hidden.bs.modal', function () {
        var data = getJSONData(window.location.href);
        history.replaceState(data, document.title, document.location.href);
        updateContent(data);
    });
    
});