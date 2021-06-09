var bindEvent = function(){
    var r1
    $('.vcode-img').click(function(){
        var r = Math.ceil(Math.random()*10000000);
        while(r === r1){
            r = Math.ceil(Math.random()*10000000);
        }
        $(this).css({
            background:'url('+ server + 'Kaptcha?' + r + ')',
            backgroundSize:'cover'
        });
        r1 = r;
    })
    $('.change-tip').click(function(){
        changeLoginMethod($(this))
    })
}