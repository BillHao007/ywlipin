function firstEnterPage(){
    var username = sessionStorage.getItem('username')
    var userstatus = sessionStorage.getItem('userstatus')
    if(username){
        $('.login-status').show();
        $('.unlogin-status').hide();
        $('#username').text(username).parent().addClass('layui-this');
        if(userstatus == "1"){
            $('.login-status .layui-nav-child').remove();
        }
        var no = getUrlPara('data-no');
        $('.user-center-site-tree .layui-nav-item:eq('+no+')').addClass('layui-this');
        loadUserCenterSideContent($('.layui-side-scroll .layui-nav a:first'));
    }
    else{
        $('.login-status').hide();
        $('.unlogin-status').show();
        $('.login-status .layui-nav-child').remove();
        layui.use('layer', function(){
            layer.alert('请先登录', {title:"提示信息",closeBtn:0}, function(){
                clearUserLoginInfo();
                window.location.href = '../login/login.html';
            })
        })
    }
}

//加载侧栏对应的内容
function loadUserCenterSideContent(ele){
    var no = ele.data('no');
    if(no == 5){
        layer.confirm('您是否确定退出登录？', {title:'提示信息'}, function(){
            clearUserLoginInfo();
            window.location.href="../homepage/homepage.html";
        })
        return ;
    }
    var status = FIRSTCLICK[no]
    
    if(status){
        $('.site-content').hide();
        $('.site-content' + no).show();
        if(no == 1){
            getAnnList({
                publisher:null,
                type:null
            });
        }
    }
    else{
        $('.site-content').hide();
        $('.site-content' + no).load('preload/' + no + '.html', null, 
        function(response, status, xhr){
            if(form){
                form.render();
            }
            else{
                layui.use('form', function(){
                    form = layui.form;
                })
            }
            if(no === 0){
                uploadPicture('#uploadGiftPic', '.uploadPicBox');
                getGiftList(0, {});
            }
            else if(no === 1){
                getAnnList({
                    publisher:null,
                    type:null
                });
                layui.use('laydate', function(){
                    var laydate = layui.laydate;
                    laydate.render({
                        elem:'#annDate'
                    })
                })
                if($.cookie('gift')){
                    gift = JSON.parse($.cookie('gift'));
                    $('.gift-id').text(gift.giftid);
                    $('.gift-name').text(gift.name);
                }
                // layui.use('layarea', function(){
                //     var layarea = layui.layarea;;
                //     layarea.render({
                //         elem: '#area-picker',  //加载省市区联动选择器
                //     });
                // })
                // layui.use('laydate', function(){
                //     var laydate = layui.laydate;
                //     laydate.render({
                //         elem:'#layDate1'
                //     })
                //     laydate.render({
                //         elem:'#layDate2'
                //     })
                // })
                // loadFile();
                //getOrderList();
            }
            else if(no === 2){
                layui.use('laydate', function(){
                    var laydate = layui.laydate;
                    laydate.render({
                        elem:'#layDate1'
                    })
                    laydate.render({
                        elem:'#layDate2'
                    })
                })
                getExpressOrderDetailList(0, {
                    thirPartId:null,
                    expressId:null,
                    orderId:null,
                    beginTime:null,
                    endTime:null,
                    goodName:null
                });
            }
            else if(no === 3){
                getUserList()
            }
            else if(no === 4){

            }
            
        })
        $('.site-content' + no).show();
        FIRSTCLICK[parseInt(no)] = 1;
    }
}


//上传图片控件加载
function uploadPicture(id, imgBox, giftId){
    layui.use('upload', function(){
        var upload = layui.upload;
        uploadInst = upload.render({
            elem: id,
            url:SERVER + 'upload',
            headers:{
                "token":localStorage.getItem('token')
            },
            accept:'images',
            choose:function(obj){
                obj.preview(function(index, file, result){
                    $(imgBox + ' img').attr('src', result);
                })
            },
            done:function(res, index, upload){
                console.log(res);
                if(res.code == 0){
                    if(giftId){
                        editGiftInfo({
                            giftId:giftId,
                            image:res.data.image
                        }, 'update');
                    }
                    else{
                        $(imgBox + ' img')
                            .attr('src', 'http://zhangxt955.natapp1.cc' + res.data.image)
                            .css('margin-bottom','20px');
                    }
                }
                else if(res.code == -1){
                    layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                        clearUserLoginInfo();
                        window.location.href = '../login/login.html';
                    })
                }
                else{
                    layer.msg(res.info);
                }
            }
        });
    })
}

function getWareHouse(status){
    switch(status){
        case 0: return null;
        case 1: return '义乌仓储';
    }
}