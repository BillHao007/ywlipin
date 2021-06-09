// var reloadVcode = function(img){
//     var r1 = Math.ceil(Math.random()*10000000)
//     var par = img.parent();
//     var address = server + 'Kaptcha' + r1
//     img.remove();
//     par.append(`<a class="vcode-img" style="background:url(${address})";></a>`);
//     $('.vcode-img').click(function(){
//         reloadVcode($(this));
//     })
// }

var changeLoginMethod = function(p){
    var input = $('#login-username');
    if(input.attr('lay-verify') == 'userName'){
        p.text('使用用户名登录');
        input.parent().prev().text('手机号');
        input.attr({
            placeholder:'请输入手机号',
            "lay-verify":'phone'
        })
    }
    else{
        p.text('使用手机号登录');
        input.parent().prev().text('用户名');
        input.attr({
            placeholder:'请输入用户名',
            "lay-verify":'userName'
        })
    }
}