var layer;

$(function(){
    $(".vcode-img").css({
        background: 'url('+ server + 'Kaptcha?0)',
        backgroundSize:'cover'
    });
    bindEvent();
})

layui.use('element', function(){
    var element = layui.element;
    element.on('tab(changeTab)', function(data){
        if(data.index == 0){
            $('.board').css('height', '360px')
        }
        else if(data.index == 1){
            $('.board').css('height', '410px')
        }
    })
})

layui.use('layer', function(){
    layer = layui.layer
})

layui.use('form', function() {
    var form = layui.form;
    //自定义验证规则
    form.verify({
        userName:function(value, item){
            var id = item.getAttribute('id');
            let repeat = false;
            let serverErr = false;
            if(!value.match(/^[\S]{4,20}$/)){
                return '用户名必须4到12位，且不能出现空格'
            }
            if(id === 'sign-username'){
                $.ajax({
                    url:server + 'register/checkoutUserName',
                    async: false,
                    type:'get',
                    data:{
                        userName:value
                    },
                    success:function(data, textStatus){
                        if(data.success === -1){
                            repeat = true
                        }
                    },
                    error:function(msg){
                        serverErr = true;
                        layer.msg('服务器访问失败，请稍后重试');
                    }
                })
            }
            
            if(repeat){
                return '该用户名已被注册'
            }
            if(serverErr){
                return '';
            }
        },
        phone_r:function(value, item){
            let repeat = false;
            let serverErr = false;
            $.ajax({
                url:server + 'register/checkoutPhone',
                async: false,
                type:'get',
                data:{
                    phone:value
                },
                success:function(data, textStatus){
                    if(data.success == -1){
                        repeat = true;
                    }
                },
                error:function(msg){
                    serverErr = true;
                    layer.msg('服务器正在维护，请稍后尝试');
                }
            })
            if(repeat){
                return '该手机号已被注册'
            }
            if(serverErr){
                return '';
            }
        },
        password:[
            /^[\S]{4,20}$/
            ,'密码必须4到20位，且不能出现空格'
        ],

        passagain:function(value, textStatus){
            var signPass = $('#signpass').val();
            if(signPass !== value){
                return '两次的密码不一致'
            }
        }
    });

    
    //监听提交
    form.on('submit(loginBtn)', function(data){
        var loadlayer = layer.load(1);
        var formData = data.field;
        var password = formData.password;
        hash = hex_md5(password);
        formData.password = hash;
        $.ajax({
            url:server + 'login/login',
            type:'post',
            data:formData,
            success:function(data, textStatus){
                layer.close(loadlayer);
                if(data.success == 1){
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('username', data.username);
                    sessionStorage.setItem('userstatus', data.status);
                    window.location.href = '../homepage/homepage.html';
                }
                else if(data.success == 2){
                    layer.prompt({
                        formType:1,
                        title:'您已超过90天未登录，请更改您的登陆密码',
                    }, function(value, index, elem){
                        if(value.match(/^[\S]{4,20}$/g)){
                            layer.close(index);
                            updatePassword90(value)
                        }
                        else{
                            layer.msg('密码必须4到20位，且不能出现空格');
                        }
                    })
                }
                else if(data.success == -1000){
                    layer.msg('您输入的用户名或密码有误')
                }
                else{
                    layer.msg(data.info);
                }
            },
            error:function(msg){
                layer.close(loadlayer);
                layer.alert('服务器正在维护，请稍后重试', {title:'提示信息'});
            }
        })
        return false;
    });

    form.on('submit(signBtn)', function(data){
        if(data.field.verifyCode == ''){
            layer.msg('您未输入验证码');
            return false;
        }
        let loadlayer = layer.load(1);
        $('#sign-btn').attr('disabled', 'disabled').addClass('layui-btn-disabled')
        var formData = data.field;
        var password = formData.password;
        hash = hex_md5(password);
        formData.password = hash;
        formData.securityQuestion = 1;
        formData.questionAnswer = '000';
        formData.code = formData.verifyCode;
        $.ajax({
            url:server + 'register/submitRegisterInfo',
            type:'post',
            data:formData,
            success:function(data, textStatus){
                layer.close(loadlayer);
                if(data.success){
                    layer.alert(data.info+'，请选择登录', {title:'提示信息'}, function(){
                        window.location.reload();
                    });
                }
                else{
                    $('#sign-btn').removeAttr('disabled').removeClass('layui-btn-disabled')
                    layer.msg(data.info);
                }
            },
            error:function(msg){
                layer.close(loadlayer)
                layer.alert('服务器正在维护，请稍后重试', {title:'提示信息'});
            }
        })
        return false;
    });

    form.on('submit(getVerifyCode)', function(data){
        getVerifyCode(data.field.phone)
        var idx = 60;
        $('.verifyCode-tip').attr('disabled', true).text('重新获取('+idx+')').addClass("layui-btn-disabled");
        var interval = setInterval(function(){
            $('.verifyCode-tip').text('重新获取('+(--idx)+')');
            if(idx == 0){
                clearInterval(interval);
            }
        }, 1000);
        setTimeout(function(){
            $('.verifyCode-tip').removeAttr('disabled').text('获取验证码').removeClass('layui-btn-disabled')
        }, 60000)
    })

})

function updatePassword90(password){
    $.ajax({
        url:server + 'login/updatePassword',
        type:'post',
        data:{
            newPassword:hex_md5(password)
        },
        success:function(data, textStatus){
            if(data.success == 1){
                layer.msg('密码修改成功');
            }
            else{
                layer.msg(data.info);
            }
        },
        error:function(){
            layer.alert('服务器正在维护，请稍后重试', {title:'提示信息'});
        }
    })
}

function getVerifyCode(phone){
    $.ajax({
        url:server + 'register/getSMS',
        type:'post',
        data:{phone:phone},
        success:function(data, textStatus){
            layer.msg(data.info);
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试');
        }
    })
}