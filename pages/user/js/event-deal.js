var uploadInst
function firstEnterPage(){
    var username = sessionStorage.getItem('username')
    var userstatus = sessionStorage.getItem('userstatus')
    if(username){
        $('.login-status').show();
        $('.unlogin-status').hide();
        if(userstatus == "1"){
            $('.login-status .layui-nav-child').remove();
        }
        $('#username').text(username).parent().addClass('layui-this');
        getUserInfo();
        var no = getUrlPara('data-no');
        $('.user-center-site-tree .layui-nav-item:eq('+no+')').addClass('layui-this');
        loadUserCenterSideContent($('[data-no=' + no +']'));
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


//上传表格文件并解析
var loadFile = function(){
    layui.use('upload', function(){
        var upload = layui.upload;
        uploadInst = upload.render({
            elem: '#uploadBtn',
            multiple:true,
            accept:'file',
            exts:'xls|xlsx|csv',  //仅支持这三类文件
            auto:false,
            choose:function(obj){
                fileList = obj.pushFile();
                obj.preview(function(index, file, result){
                    var par = $('#uploadBtn').parent();
                    par.append('<div class="file-item" data-fileid=' + index + '>' + file.name + 
                                    '<a href="javascript:;" onclick="deleteFile($(this))">删除</a></div>')
                    readExcelSheet(file)  //解析表格文件
                })
            }
        });
    })
}


//加载侧栏对应的内容
var loadUserCenterSideContent = function(ele){
    var no = ele.data('no');
    if(no == 6){
        layer.confirm('您是否确定退出登录？', {title:'提示信息'}, function(){
            clearUserLoginInfo();
            window.location.href="../homepage/homepage.html";
        })
        return ;
    }
    var status = FIRSTCLICK[parseInt(no)]
    
    if(status){
        $('.site-content').hide();
        $('.site-content' + no).show();
        if(no === 0){
            $('#username').text($.cookie('username'));
            $('#money').text($.cookie('balance'));
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
                let time = new Date(parseInt(sessionStorage.getItem('signTime')));
                time = time.getFullYear()+'年'+(time.getMonth()+1)+'月'+time.getDate()+'日';
                $('#head-username').text(sessionStorage.getItem('username'))
                $('#user-name').text(sessionStorage.getItem('username'));
                $('#phone-num').text(sessionStorage.getItem('phone'));
                $('#money').text(sessionStorage.getItem('balance'));
                $('#sign-time').text(time);
            }
            if(no === 1){
                if($.cookie('gift')){
                    gift = JSON.parse(sessionStorage.getItem('gift'));
                    $('.gift-id').text(gift.giftId);
                    $('.gift-name').text(gift.giftName);
                    $('.gift-price').text(gift.price);
                    $('.gift-weight').text(gift.weight);
                    $('.gift-rest').text(gift.rest);
                    $('.total').text(gift.price);
                }
                layui.use('laydate', function(){
                    var laydate = layui.laydate;
                    laydate.render({
                        elem:'#layDate1'
                    })
                    laydate.render({
                        elem:'#layDate2'
                    })
                })
                loadFile();
                getOrderList({
                    orderId:null,
                    beginTime:null,
                    endTime:null
                });
            }
            if(no === 3){
                layui.use('laydate', function(){
                    var laydate = layui.laydate;
                    laydate.render({
                        elem:'#expLayDate1'
                    })
                    laydate.render({
                        elem:'#expLayDate2'
                    })
                })
                let orderid = getUrlPara('orderid');
                if(orderid){
                    $('input[name=filter_orderid]').val(orderid);
                    getOrderDetail({
                        orderId:orderid,
                        thirPartId:null,
                        expressId:null,
                        beginTime:null,
                        endTime:null,
                        deliver:null
                    })
                }
            }
            if(no === 4){
                layui.use('form', function(){
                    let form = layui.form;
                    form.render('select', 'chargeNumber');
                    $('#change-amount')
                    .find('input').removeAttr('readOnly')
                    .attr({
                        id:'record-charge-num',
                        autocomplete:"off"
                    });
                })
                //还要写一个加载账户资金明细
            }
            
        })
        $('.site-content' + no).show();
        FIRSTCLICK[parseInt(no)] = 1;
    }
}


var deleteFile = function(ele){
    var par = ele.parent();
    var fileId = par.data('fileid');
    var name = fileList[fileId].name;
    var startItem = fileItemRange[name][0];
    var length = fileItemRange[name][1];
    var start;
    for(let i = 0; i < orderList.length; i++){
        if(startItem == orderList[i]){
            start = i;
        }
    }
    delete fileList[fileId];
    $('.layui-upload-file').attr('type', 'hidden');//重置input,以便重新上传删除过的文件
    $('.layui-upload-file').attr('type', 'file');
    orderList.splice(start, length);
    par.remove();
}


var alertPreOrderLayer = function(data){
    let content = `
        <div id="wrapper-precharge">
            <p id="pay-order-id">订单号：<span>${data.orderId}</span></p>
            <p id="pay-info"><span class="amount">充值金额：<span>￥${data.chargeNum}</span way></span><span>充值方式：<span class="">${data.payTool}</span></span></p>
            <p class="tip">请用支付宝扫描下方二维码进行支付</p>
            <img src="http://zhangxt955.natapp1.cc${data.src}" width="300px" />
        </div>
    `;
    layer.ready(function(){
        return layer.open({
                    type:1,
                    title:'支付确认',
                    area:['400px', '560px'],
                    content:content
               })
    })
}

var alertPurchaseLayer = function(data){
    let content = `
        <div id="wrapper-pay-confirm" data-warehouse="${data.warehouse}">
            <p class="cost-line">您本次消费：<span id="cost">￥${data.totalcost}</span></p>
            <p class="rest-line">您的账户余额：<span id="rest">￥${data.rest}</span></p>
            <form class="layui-form layui-form-pane" action="">
                <div class="layui-form-item">
                    <label class="layui-form-label">支付密码</label>
                    <div class="layui-input-block">
                    <input type="password"
                            name="paypass" 
                            required  
                            lay-verify="required" 
                            placeholder="请输入支付密码" 
                            autocomplete="off"
                            class="layui-input"
                            lay-verType="tips">
                    </div>
                </div>
                <div class="layui-form-item">
                    <button class="layui-btn layui-btn-fluid pay-btn" lay-submit lay-filter="payBtn">立即支付</button>
                </div>
            </form>
        </div>
    `;
    layer.open({
        type:1,
        title:'支付确认',
        content:content,
        area: ['400px', '300px']
    })
}

function getWareHouse(id){
    switch(id){
        case 0:return null;
        case 1:return '义乌仓储';
    }
}