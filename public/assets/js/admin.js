$(document).ready(function(){
    
    /*  edit user details
    ======================================================================*/
    var refreshEditUser = function(){
        $('.editUser').on('click',function(){
            $('.editUser').removeClass('active');
            $('#addNewUser').removeClass('active');
            $(this).addClass('active');
            $('#template').html('<img src="/assets/images/loading.gif">');
            $.getJSON('/admin/'+$(this).data('id'),function(data){
                var html = new EJS({url: '/templates/user_edit_template.ejs'}).render(data);
                $('#template').html(html);
                
                refreshAll();
            });
        });
    };
    
    refreshEditUser();
    
    /*  add new user
    ======================================================================*/
    $('#addNewUser').on('click',function(){
        $('.editUser').removeClass('active');
        $(this).addClass('active');
        var html = new EJS({url: '/templates/user_add_template.ejs'}).render({});
        $('#template').html(html);
        
        $('#username').focus();
        
        refreshAll();
    });
    
    /*  show/hide password
    ======================================================================*/
    var refreshShowHidePassword = function(){
        $('#showHidePassword').click(function(){
            if($(this).is(':checked')) {
                $('#password').attr('type','text');
            } else {
                $('#password').attr('type','password');
            }
        });
    };
    refreshShowHidePassword();
    
    /*  refresh listsners
    ======================================================================*/
    var refreshAll = function(){
        refreshUserSubmit();
        refreshAddAlias();
        refreshRemoveAlias();
        refreshDeleteUser();
        refreshShowHidePassword();
    };
    
    /*  delete existing user
    ======================================================================*/
    var refreshDeleteUser = function(){
        $('#deleteUser').on('click',function(){
            var $el = $(this);
            bootbox.confirm('Are you sure?',function(result){
                if(result) {
                    $.ajax({
                        url: '/admin/'+$($el).closest('#table').data('userid'),
                        type: 'DELETE',
                        success: function(result) {
                            notify('<div class="alert alert-success"><i class="fa fa-check"></i>&ensp;Successfully deleted user: "'+$('#userList').find('[data-id="' + result.id + '"]').data('username')+'"</div>');
                            reset();
                            $('#userList').find('[data-id="' + result.id + '"]').slideUp(function(){$($el).remove()});
                        }
                    });
                }
            });
        });
    };
    
    /*  reset template to initial state
    ======================================================================*/
    var reset = function(){
        $('#template').html('Please choose an existing user to edit or try adding a new user<br>'+
                            '<img src="/assets/images/arrow.png" width="100px" style="margin-left:-40px" />');
    };
    
    /*  get current users as an array
    ======================================================================*/
    var getUsers = function(){
        var users = [];
        $('#userList a').each(function(){
            users.push($(this).data('username'))
        });
        return users;
    };
    
    /*  user details submit button (both for new, existing and admin)
    ======================================================================*/
    var refreshUserSubmit = function(){
        $('#userSubmit').on('click',function(){
            var id = $('#table').data('userid');
            var username = $('#table').find('#username').val()
            var password = $('#table').find('#password').val();
            var aliases = [];
            $('#table .alias').each(function(){
                aliases.push({
                    name:$(this).find('#name').val(),
                    path:$(this).find('#path').val(),
                })
            });
            
            var data = {
                _id:id,
                username:username,
                password:password,
                aliases:aliases
            }
            
            var error = false;
            if (!data.username || !data.password)
                error=true;
            for(i in data.aliases)
                if(!data.aliases[i].name || !data.aliases[i].path)
                    error=true;
            
            if(error) {
                notify('<div class="alert alert-warning"><i class="fa fa-warning"></i>&ensp;All fields are required</div>');
                return;
            }
            
            
            // if new user
            if(data._id=='new') {
                
                if($.inArray(data.username,getUsers())!=-1) {
                    $('#username').focus();
                    notify('<div class="alert alert-warning"><i class="fa fa-warning"></i>&ensp;Username already in use.</div>');
                    return;
                }
                
                delete data._id;
                $.post('/admin',data,function(res){
                    $('<a href="javascript:void(0)" data-id="'+res._id+'" data-username="'+res.username+'" class="list-group-item editUser">'+
                        '<i class="fa fa-user"></i>&ensp;'+res.username+'</a>').appendTo('#userList').hide().slideDown();
                    
                    notify('<div class="alert alert-success"><i class="fa fa-check"></i>&ensp;Successfully added</div>');
                    
                    $('#addNewUser').removeClass('active');
                    $('#userList').find('[data-id="' + res._id + '"]').addClass('active');
                    $.getJSON('/admin/'+res._id,function(data){
                        var html = new EJS({url: '/templates/user_edit_template.ejs'}).render(data);
                        $('#template').html(html);
                        
                        refreshAll();
                    });
                    
                    
                    refreshEditUser();
                });
            } else /* if existing user*/ {
                
                // if admin
                if($('#table').data('role')=='admin') {
                    var id= data._id;
                    delete data._id;
                    delete data.aliases;
                    data.username='admin';
                                    
                    $.ajax({
                        type: 'PUT',
                        contentType: 'application/json',
                        url: '/admin/'+id,
                        dataType: "json",
                        data: JSON.stringify(data),
                        success: function(data, textStatus, jqXHR){
                            notify('<div class="alert alert-success"><i class="fa fa-check"></i>&ensp;Admin password updated</div>');
                        },
                        error: function(jqXHR, textStatus, errorThrown){
                            notify('<div class="alert alert-danger"><i class="fa fa-warning"></i>&ensp;Error occured: ' + textStatus + '</div>');
                        }
                    });
                } else /* if not admin*/ {
                    
                    var usersArray = getUsers();
                    
                    var index = usersArray.indexOf($('#table').find('[data-originalusername]').data('originalusername'));
                    if (index > -1)
                        usersArray.splice(index, 1);
                    
                    if($.inArray(data.username,usersArray)!=-1) {
                        $('#username').focus();
                        notify('<div class="alert alert-warning"><i class="fa fa-warning"></i>&ensp;Username already in use.</div>');
                        return;
                    }
                    
                    if(hasDuplicateAliases()) {
                        notify('<div class="alert alert-warning"><i class="fa fa-warning"></i>&ensp;Duplicate alias names are not allowed</div>');
                        return;
                    }
                    
                    var id= data._id;
                    delete data._id;
                                    
                    $.ajax({
                        type: 'PUT',
                        contentType: 'application/json',
                        url: '/admin/'+id,
                        dataType: "json",
                        data: JSON.stringify(data),
                        success: function(data, textStatus, jqXHR){
                            notify('<div class="alert alert-success"><i class="fa fa-check"></i>&ensp;User profile updated</div>');
                            
                            $('#userList .active').replaceWith('<a href="javascript:void(0)" data-id="'+id+'" data-username="'+data.username+'" class="list-group-item editUser active"><i class="fa fa-user"></i>&ensp;'+data.username+'</a>');
                            
                            refreshEditUser();
                            
                            
                        },
                        error: function(jqXHR, textStatus, errorThrown){
                            notify('<div class="alert alert-danger">Error occured: ' + textStatus + '</div>');
                        }
                    });
                }
            }
            
        });
    }
    
    /* find duplicate aliases for a user on submit
    ======================================================================*/
    var hasDuplicateAliases = function(){
        var aliases = [];
        $('#table .alias').each(function(){
            aliases.push($(this).find('#name').val())
        });
        return has_duplicates(aliases);
    };
    
    /* notification alerts
    ======================================================================*/
    var notify = function(message) {
        $('#notifications').hide().html(message).slideDown();
        $('#notifications').show();
        setTimeout(function(){
            $('#notifications').slideUp();
        },3000);
    };
    
    /*  remove an alias for a user
    ======================================================================*/
    var refreshRemoveAlias = function(){
        $('.removeAlias').on('click',function(){
            var $el = $(this);
            bootbox.confirm('Are you sure you want to remove this alias?', function(result) {
                if(result) {
                    $($el).closest('tr.alias').remove();
                }
            }); 
        });
    };
    
    /*  add an alias
    ======================================================================*/
    var refreshAddAlias = function(){
        $('#addAlias').on('click',function(){
            $('<tr class="alias">'+
                '<td>Alias:</td>'+
                '<td>'+
                    '<div class="form-inline">'+
                        '<div class="form-group">'+
                            '<input type="text" class="form-control" placeholder="name" id="name"  />'+
                        '</div>&nbsp;'+
                        '<div class="form-group">'+
                            '<input type="text" class="form-control" placeholder="path" id="path" />'+
                        '</div>&nbsp;'+
                        '<div class="form-group">'+
                            '<button class="btn btn-danger removeAlias"><i class="fa fa-times"></i> Remove</button>'+
                        '</div>'+
                    '</div>'+
                '</td>'+
            '</tr>').insertBefore('#addAliasRow').hide().fadeIn();
            
            refreshRemoveAlias();
        });
    };
    
    /*  function to determine if an array has duplicates // returns true if there are duplicates otherwise false
    ======================================================================*/
    function has_duplicates(arr) {
        var duplicates;
        for (i = 0; i < arr.length; i++) {
            checker = arr[i];
            duplicates = 0;
            for (x = 0; x < arr.length; x++)
                //if duplicate
                if (checker == arr[x])
                    duplicates++;
        }
        //if has duplicate
        if (duplicates > 1)
            return true;
        else
            return false;
    }
    
});