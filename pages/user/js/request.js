var token = localStorage.getItem('token')

//支付宝预充值请求
function preCharge(chargeNumber, chargeWay, loadLayer){
    let interface = ['payment/pay'];  //支付宝接口
    $.ajax({
        headers:{
            'token':token
        },
        url:SERVER + interface[chargeWay],
        type:'post',
        data:JSON.stringify({
            payment:chargeNumber,
        }),
        contentType:'application/json',
        success:function(data, textStatus){
            if(data.code == 0){
                var drawData = {
                    orderId:data.data.payOrderId,
                    src:data.data.qrUrl,
                    chargeNum:chargeNumber,
                    payTool:PAYTOOL[chargeWay]
                }
                layer.close(loadLayer);  //关闭加载弹窗
                let preOrderLayer = alertPreOrderLayer(drawData);
                searchPayStatus(chargeWay, data.data.payOrderId, preOrderLayer)
            }
            else if(data.code == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })
            }
            else{
                layer.alert(data.msg, {title:'提示信息'})
            }
            
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试')
        }
    })
}

//查询支付状态请求
function searchPayStatus(chargeWay, orderId, preOrderLayer){
    var interval = setInterval(function(){
        $.ajax({
            headers:{
                'token':token
            },
            url:SERVER + 'payment/query_pay_status',
            type:'post',
            data:JSON.stringify({
                payOrderId:orderId,
            }),
            contentType:'application/json',
            success:function(data, textStatus){
                if(data.code == 0){
                    layer.alert('充值成功',{
                        title:'提示信息',
                    }, function(){
                        window.location.href='user.html?data-no=4'
                    })
                    clearInterval(interval);
                }
                else if(data.code == -1){  //暂时当作登录问题的处理块
                    layer.alert('您的登录信息已过期，请重新登录',{
                        title:'提示信息',
                    }, function(){
                        clearUserLoginInfo()
                        window.location.href='../login/login.html'
                        
                    })
                }
                else if(data.code == 2){
                    layer.alert(data.msg,{
                        title:'提示信息',
                    }, function(){
                        layer.close(preOrderLayer);
                    })
                    clearInterval(interval)
                }
                else if(data.code != 1){
                    layer.alert(data.msg,{
                        title:'提示信息',
                    }, function(){
                        layer.close(preOrderLayer);
                    })
                    clearInterval(interval)
                }
            }
        })
    }, 3000)
}

//提交订单请求
function purchaseRightNow(sendData, loadlayer){
    console.log(sendData);
    $.ajax({
        headers:{
            'token':token
        },
        url:SERVER + 'express/payExpress',
        type:'post',
        data:JSON.stringify(sendData),
        contentType:'application/json;charset=utf-8',
        success:function(data, textStatus){
            layer.close(loadlayer);
            if(data.success == 1){
                layer.alert('购买成功', {
                    title:"提示信息"
                }, function(){
                    window.location.href='user.html?data-no=1'
                })
            }
            else if(data.success == 0){
                layer.alert('您的余额不足，请前往充值', {title:'提示信息'});
                $('.pay-btn').removeAttr('disabled').removeClass('layui-btn-disabled');
            }
            else if(data.success == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })        
            }
            else{
                layer.msg(data.info);
                $('.pay-btn').removeAttr('disabled').removeClass('layui-btn-disabled');
            }
        },
        error:function(msg){
            layer.close(loadlayer)
            layer.msg('下单失败，请验证表格数据后重试')
            $('.pay-btn').removeAttr('disabled').removeClass('layui-btn-disabled');
        }
    })
}



//预提交订单
function prePurchase(warehouse){
    var ware = getWareHouse(warehouse);
    $.ajax({
        headers:{
            "token":token
        },
        url:SERVER + 'express/getTotalPrice',
        type:'post',
        data:JSON.stringify({
            warehouse:ware,
            cityArray:cityArray,
            giftId:gift.giftId
        }),
        contentType:'application/json;charset=utf-8',
        success:function(data, textStatus){
            if(data.success == 1){
                let sendData = {
                    totalcost:data.totalPrice,
                    rest:$.cookie('balance'),
                    warehouse:ware
                }
                alertPurchaseLayer(sendData)
            }
            else if(success == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })
            }
        },
        error:function(msg){
            layer.alert('服务器正在维护，请稍后重试', {title:'提示信息'});
        }
    })
}


//获取用户信息
function getUserInfo(){
    var layer, loadlayer;
    layui.use('layer', function(){
        layer = layui.layer;
        loadlayer = layer.load(1);
    })
    
    $.ajax({
        headers:{
            "token":token
        },
        url:SERVER + 'personPage/personInfo',
        async:false,
        type:'get',
        success:function(data, textStatus){
            if(data.success == 1){
                sessionStorage.setItem('balance', data.balance);
                sessionStorage.setItem('phone', data.user.phone);
                sessionStorage.setItem('signTime', data.user.createTime);
            }
            else if(data.success == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })            
            }
            else{
                layer.msg(data.info);
            }
            layer.close(loadlayer);
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试');
            layer.close(loadlayer);
        }
    })
}

//获取订单列表
function getOrderList(sendData){
    layui.use('table', function(){
        table = layui.table;
        table.render({
            elem:'#order-list',
            url:SERVER + 'personPage/searchOrderByCondition',
            where:sendData,
            headers:{
                'token':token
            },
            request:{
                pageName:'pageNum',
                limitName:'pageSize'
            },
            response:{
                statusCode:1  //规定状态码为1表示成功
            },
            parseData:function(res){
                if(res.success == -1){
                    layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                        clearUserLoginInfo();
                        window.location.href = '../login/login.html';
                    })
                }
                let expressOrderList = res.expressOrderList;
                for(let i = 0; i < expressOrderList.length; i++){
                    let time = new Date(expressOrderList[i].finishTime);
                    expressOrderList[i].finishTime = time.getFullYear()+'年'+(time.getMonth()+1)+'月'+time.getDate()+'日'
                }
                return {
                    'code':res.success,
                    'msg':res.info,
                    'count':res.total,
                    'data':expressOrderList
                }
            },
            cols:[[
                {field:'orderId', title: '订单编号'}
                ,{field:'finishTime', title: '购买时间'}
                ,{field:'warehouse', title: '发货仓储'}
                ,{field:'goodsName', title: '购买礼品'}
                ,{field:'goodsPrice', title:'礼品单价'}
                ,{field:'expressNum', title: '数量'}
                ,{field:'money', title: '消费金额'}
                ,{title: '操作', toolbar: '#tableRowTool', fixed:'right', width:180}
            ]],
            page:true,
            toolbar:true
        })
    })
}

//获取订单详情
function getOrderDetail(sendData){
    console.log(sendData);
    layui.use('table', function(){
        let table = layui.table;
        table.render({
            elem:'#express-order-detail',
            url:SERVER + 'personPage/searchExpressByCondition',
            where:sendData,
            headers:{
                'token':token
            },
            request:{ //将默认的分页参数改成需要的
                pageName:'pageNum',
                limitName:'pageSize',
            },
            response:{
                statusCode:1  //规定状态码为1表示成功
            },
            parseData:function(res){
                if(res.success == -1){
                    // layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    //     clearUserLoginInfo();
                    //     window.location.href = '../login/login.html';
                    // })
                }
                let expressList = res.expressList;
                for(let i = 0; i < expressList.length; i++){
                    expressList[i].address = expressList[i].province + expressList[i].city + expressList[i].expArea + expressList[i].address;
                    expressList[i].mark = expressList[i].mark ? '成功' : '失败';
                    expressList[i].deliver = expressList[i].deliver ? '已发货' : '未发货';
                }
                return {
                    'code': res.success,
                    'msg': res.info,
                    'count':res.total,
                    'data': expressList
                }
            },
            cols:[[
                {field:'orderId', title: '平台订单号'}
                ,{field:'thirPartId', title: '第三方订单号'}
                ,{field:'expressId', title: '快递单号'}
                ,{field:'name', title: '收件人姓名'}
                ,{field:'phone', title: '电话号码'}
                ,{field:'address', title: '收件地址'}
                ,{field:'deliver', title: '快递单状态'}
                ,{field:'mark', title: '下单状态'}
                ,{field:'markDestination', title:'备注'}
            ]],
            page:true,
            toolbar:true
        })
    })
}



function updatePassword(data, passType, address){
    $.ajax({
        headers:{
            'token':token
        },
        url:SERVER + address,
        type:'post',
        data:{
            oldPayPassword:data.oldPass,
            newPayPassword:data.newPass
        },
        success:function(data, textStatus){
            if(data.success == 1){
                layer.msg(passType + '修改成功');
            }
            else if(data.success == -1){
                layer.msg(data.info + '，可能是旧密码错误， 也可能是登录信息过期');
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试')
        }
    })
}