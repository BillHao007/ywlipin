$('#footer-year').text(new Date().getFullYear());
$('#logout').click(function(){
    layui.use('layer', function(){
        layer.confirm('您是否确定退出登录？', {title:'提示信息'}, function(){
            clearUserLoginInfo();
            window.location.href="../homepage/homepage.html";
        })
    })
})

function initUserLoginInfo(){
    var username = sessionStorage.getItem('username')
    var userstatus = sessionStorage.getItem('userstatus')
    if(username){
        $('.login-status').show();
        $('.unlogin-status').hide();
        $('#username').text(username);
        if(userstatus == "1"){
            $('.login-status .layui-nav-child').remove();
        }
    }
    else{
        $('.login-status').hide();
        $('.unlogin-status').show();
        $('.login-status .layui-nav-child').remove();
    }
}

function clearUserLoginInfo(){
    localStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userstatus');
    sessionStorage.removeItem('phone');
    sessionStorage.removeItem('gift');
    sessionStorage.removeItem('balance');
    sessionStorage.removeItem('signTime');
    $('.unlogin-status').show();
    $('#username').text('')
    $('.login-status').hide();
}