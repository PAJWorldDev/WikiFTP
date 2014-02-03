$(document).ready(function(){
    "use strict";
    
    
    var showAlert = function(message,type) {
        $('#alerts').html('<div class="alert alert-'+type+'">'+message+'</div>').hide().slideDown();
        setTimeout(function(){
            $('#alerts').slideUp()
        },2000);
    }
    
    $("#myform").submit(function() {
        
        $('#alerts').html('');
        
        if(this.oldPassword.value.trim() == '' ||
           this.newPassword.value.trim() == '' ||
           this.confirmNewPassword.value.trim() == '') {
            showAlert('<i class="fa fa-exclamation-circle"></i>&ensp;All fields are required!','danger');
            return false
        }
        
        if(this.newPassword.value != this.confirmNewPassword.value) {
            showAlert('<i class="fa fa-exclamation-circle"></i>&ensp;New passwords do not match','danger');
            return false
        }
        
        $('#button').html('Updating...');
        $.ajax({
            type: "POST",
            url: '/settings/save',
            data: $("#myform").serialize(),
            success: function(data) {
                if(data.status=='success') {
                    showAlert('<i class="fa fa-check"></i>&ensp;Password updated','success');
                    $('#button').html('Update');
                }
                if(data.status=='failed') {
                    showAlert('<i class="fa fa-exclamation-circle"></i>&ensp;'+data.reason,'danger');
                    $('#button').html('Update');
                }
            }
        });
        
        return false;
    });
    
});