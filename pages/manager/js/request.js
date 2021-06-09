var token = localStorage.getItem('token');  //保存管理员token
var annListTable; //公告数据表格
var giftListTable;  //礼品数据表格
var expressListTable;  //快递单数据表格
var loadlayer;  //加载弹出框
var userListTable;  //用户列表数据表格


//获取并渲染用户列表
function getUserList(search){
    var itf;
    var sendData = {};
    if(search){
        itf = 'superAdmin/similarFind';
        sendData.userString = search;
    }
    else{
        itf = 'superAdmin/listNowUser';
    }
    userListTable = table.render({
        elem:'#userList',
        url:SERVER + itf,
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
            console.log(res);
            var userList = res.userList;
            if(res.success == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })
            }
            for(let i = 0; i < userList.length; i++){
                let time = userList[i].createTime;
                let standard = new Date(time);
                let date = standard.getFullYear() + '年' + (standard.getMonth() + 1) + '月' + standard.getDate() + '日';
                userList[i].createTime = date;
                if(userList[i].status == 1){
                    userList[i].status = '用户'
                }
                else if(userList[i].status == 2){
                    userList[i].status = '管理员'
                }
                else if(userList[i].status == 0){
                    userList[i].status = '已注销'
                }
            }
            return {
                'code':res.success,
                'msg':res.info,
                'count':res.total,
                'data':userList
            }
        },
        cols:[[
            {field:'userId', title: 'ID'}
            ,{field:'username', title: '用户名'}
            ,{field:'createTime', title: '注册时间'}
            ,{field:'status', title: '状态'}
            ,{field:'phone', title: '手机号'}
            ,{field:'balance', title: '余额'}
            ,{field:'orderNum', title: '下单数'}
            ,{title: '操作', toolbar: '#tableRowTool', fixed:'right', width:180}
        ]],
        page:true,
        toolbar:true
    });
}


//获取快递单列表
function getExpressOrderDetailList(status, sendData){
    loadlayer = layer.load(1);
    if(status == "1"){
        sendData.deliver = false;
    }
    else if(status == "2"){
        sendData.deliver = true;
    }
    $.ajax({
        url:SERVER + 'print/getPrint',
        headers:{
            'token':token
        },
        type:'get',
        data:sendData,
        success:function(data, textStatus){
            if(data.success == 1){
                expressList = data.printList;
                loadExpressOrderDetailList(status);
            }
            else{
                layer.msg(data.info);
            }
        },
        error:function(msg){
            layer.msg('获取快递单失败，请稍后重试')
        }
    })
}


//快递单管理表格渲染（假分页
function loadExpressOrderDetailList(status){
    let tool;
    let header = [
        {type: 'checkbox', fixed: 'left'}
        ,{field:'orderId', title: '平台订单号'}
        ,{field:'thirPartId', title: '第三方订单号'}
        ,{field:'expressId', title: '快递单号'}
        ,{field:'name', title: '收件人姓名'}
        ,{field:'phone', title: '电话号码'}
        ,{field:'add', title: '地址'}
        ,{field:'deliver', title: '快递单状态'}
        ,{field:'idx', title: '操作', fixed:'right', width:180}
    ];

    if(status == "0"){
        tool = true  //如果没有区分已发货未发货，则禁止复选框和工具条操作
        header.splice(8, 1);
        header.splice(0, 1);
    }
    else if(status == "1"){
        tool = '<div><a class="layui-btn layui-btn-sm" lay-event="deliver">选中快递单发货</a></div>'
        header[header.length - 1].toolbar = '<div><a class="layui-btn layui-btn-xs" lay-event="send">发货</a></div>'
    }
    else{
        tool = '<div><a class="layui-btn layui-btn-sm" lay-event="cancelDeliver">选中快递单取消发货</a></div>'
        header[header.length - 1].toolbar = '<div><a class="layui-btn layui-btn-xs" lay-event="cancel">取消发货</a></div>'
    }

    expressListTable = table.render({
        elem:'#express-order-detail',
        url:SERVER + 'print/index',
        headers:{
            "token":token
        },
        request:{
            pageName:'pageNum',
            limitName:'pageSize'
        },
        response:{
            statusCode:1  //规定状态码为1表示成功
        },
        parseData:function(res){
            let printList = [];
            let cnt = expressList.length;
            let st = (res.pageNum - 1) * res.pageSize;
            let ed = (cnt - st + 1) >= res.pageSize ? st + res.pageSize : cnt;  // 判断剩余数据总量是否大于页面大小，大于的话就是加载页面大小量的数据，否则就加载到最后一条数据
            let add, deliver;
            for(let i = st; i < ed; i++){
                printList.push(expressList[i])
                add = expressList[i].province+expressList[i].city+expressList[i].expArea+expressList[i].address;
                deliver = expressList[i].deliver ? '已发货' : '待发货';
                printList[printList.length - 1].add = add;
                printList[printList.length - 1].deliver = deliver;
                printList[printList.length - 1].idx = i;
            }
            layer.close(loadlayer);
            return {
                "code":1,
                "msg":"",
                "count":expressList.length,
                "data":printList
            };
        },
        cols:[header],
        page:true,
        limits:[10, 20, 50, 100, 150, 200, 250, 500, 1000], //页面大小选择框
        toolbar:tool,
    })
}


//发货（打单）请求
function printExpressOrderDetailList(code){
    var thirPartArray = [];
    if(code){
        thirPartArray.push(code);
    }
    else{
        for(let i = 0; i < expressList.length; i++){
            if(expressList[i].LAY_CHECKED && expressList[i].deliver == '待发货'){
                thirPartArray.push(expressList[i].thirPartId);
            }
        }
    }
    $.ajax({
        url:SERVER + 'print/print',
        headers:{
            token:token
        },
        type:'post',
        data:JSON.stringify({
            thirPartIdArray:thirPartArray
        }),
        contentType:"application/json",
        success:function(data, textStatus){
            console.log(data);
            if(data.success == 1){
                getExpressOrderDetailList(0, {
                    thirPartId:null,
                    expressId:null,
                    orderId:null,
                    beginTime:null,
                    endTime:null,
                    goodName:null
                });
                codeArray = [];
                cancelCodeArray = [];
                let sendData = {
                    RequestData:data.RequestData,
                    DataSign:data.DataSign,
                    EBusinessID:data.EBusinessID,
                    IsPreview:data.IsPreview
                }
                layer.alert('发货成功， 请转至快递鸟打印接口打印订单');
                requestPrintOrder(sendData);
            }
            else if(data.success == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })   
            }
            else{
                layer.alert(data.info)
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试');
        }
    })
}


//快递鸟打单接口（动态创建表单元素，模拟表单提交）
function requestPrintOrder(sendData){
    var form = $('<form></form>');
    form.attr({
        action:'http://www.kdniao.com/External/PrintOrder.aspx',
        method:'post',
        target:'_blank'
    });
    var RequestData = $('<input type="text" name="RequestData"/>');
    RequestData.val(sendData.RequestData);
    RequestData.appendTo(form);
    var DataSign = $('<input type="text" name="DataSign"/>');
    DataSign.val(sendData.DataSign);
    DataSign.appendTo(form);
    var IsPreview = $('<input type="text" name="IsPreview"/>');
    IsPreview.val(sendData.IsPreview);
    IsPreview.appendTo(form);
    var EBusinessID = $('<input type="text" name="EBusinessID"/>');
    EBusinessID.val(sendData.EBusinessID);
    EBusinessID.appendTo(form);
    $('body').append(form);
    form.submit();
    form.remove();
}


//取消发货（打印）
function cancelPrint(code){
    var cancelList = []
    if(code){
        cancelList.push(code);
    }
    else{
        for(let i = 0; i < expressList.length; i++){
            if(expressList[i].LAY_CHECKED && expressList[i].deliver == '已发货'){
                cancelList.push(expressList[i].thirPartId);
            }
        }
    }
    $.ajax({
        url:SERVER + 'print/cancel',
        headers:{
            token:token,
        },
        type:"post",
        data:JSON.stringify({
            thirPartIdArray:cancelList
        }),
        contentType:'application/json',
        success:function(data, textStatus){
            if(data.success == 1){
                layer.msg('取消发货成功');
                getExpressOrderDetailList(0, {
                    thirPartId:null,
                    expressId:null,
                    orderId:null,
                    beginTime:null,
                    endTime:null,
                    goodName:null
                });
            }
            else if(data.success == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })   
            }
            else{
                layer.msg(data.info)
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试')
        }
    })
}


//更改用户账户信息
function changeUserStatus(sendData, info){
    $.ajax({
        url:SERVER + 'superAdmin/updateUserStatusAndAvailable',
        type:'get',
        data:sendData,
        success:function(data, textStatus){
            if(data.success == 1){
                layer.msg(info)
                userListTable.reload();
            }
            else{
                layer.msg(data.info)
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试');
        }
    })
}

//获取并渲染礼品列表
function getGiftList(filter, sendData){
    var tool;
    if(filter == 0){
        tool = '<a class="layui-btn layui-btn-xs" lay-event="changePic">更换图片</a>'
    }
    else if(filter == 1){
        sendData.status = false;
        tool = '<a class="layui-btn layui-btn-xs" lay-event="onshell">上架</a>'
    }
    else{
        sendData.status = true;
        tool = '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="outshell">下架</a>'
    }
    layui.use('table', function(){
        table = layui.table;
        giftListTable = table.render({
            elem:'#giftList',
            url:SERVER + 'gift/adminSelect',
            where:sendData,
            headers:{
                'token':token
            },
            request:{
                pageName:'pageNum',
                limitName:'pageSize'
            },
            parseData:function(res){
                if(res.code == -1){
                    layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                        clearUserLoginInfo();
                        window.location.href = '../login/login.html';
                    })
                }
                let giftList = res.data;
                for(let i = 0; i < giftList.length; i++){
                    let rest = 0;
                    let warehouse = '';
                    for(let j = 0; j < giftList[i].giftRestList.length; j++){
                        rest += giftList[i].giftRestList[j].rest;
                        warehouse += (giftList[i].giftRestList[j].warehouseName + '/')
                    }
                    giftList[i].rest = rest;
                    giftList[i].warehouse = warehouse
                    giftList[i].status = giftList[i].onShell ? '已上架' : '未上架'
                }
                res.data = giftList;
                return res;
            },
            cols:[[
                {field:'giftId', title: '礼品ID'}
                ,{field:'giftName', title: '礼品名称', edit:'text'}
                ,{field:'price', title: '价格', edit:'text'}
                ,{field:'weight', title: '重量', edit:'text'}
                ,{field:'rest', title: '库存', edit:'text'}
                ,{field:'warehouse', title: '仓储'}
                ,{field:'status', title: '状态'}
                ,{field:'image', title: '操作', toolbar: '<div>' + tool + '</div>', fixed:'right'}
            ]],
            page:true,
            toolbar:true
        })
    })
}

//获取公告列表
function getAnnList(sendData){
    layui.use('table', function(){
        table = layui.table;
        annListTable = table.render({
            elem:'#annList',
            url:SERVER + 'news/select',
            where:sendData,
            headers:{
                'token':token
            },
            request:{
                pageName:'pageNum',
                limitName:'pageSize'
            },
            parseData:function(res){
                if(res.code == -1){
                    console.log(res.msg);
                    layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                        clearUserLoginInfo();
                        window.location.href = '../login/login.html';
                    })
                }
                else if(res.code == 0){
                    let annList = res.data;
                    for(let i = 0; i < annList.length; i++){
                        annList[i].type = annList[i].type ? '网站公告' : '常见问题'
                    }
                    res.data = annList;
                }
                return res;
            },
            cols:[[
                {field:'newsId', title: '公告ID'}
                ,{field:'title', title: '标题', edit:'text'}
                ,{field:'content', title: '内容', edit:'text'}
                ,{field:'type', title: '类型'}
                ,{field:'publishTime', title: '发布时间'}
                ,{field:'publisher', title: '发布人'}
                ,{title: '操作', toolbar: '#tableRowTool', fixed:'right'}
            ]],
            page:true,
        })
    })
}



//添加商品请求（添加商品button的绑定事件）
function addGift(sendData, formData){
    $.ajax({
        url:SERVER + 'gift/add',
        headers:{
            'token':token
        },
        type:'post',
        data:JSON.stringify(sendData),
        contentType:'application/json',
        success:function(data, textStatus){
            if(data.code == 0){
                console.log(data);
                editGiftInfo({
                    giftId:data.giftId,
                    warehouseName:getWareHouse(parseInt(formData.warehouse)),
                    rest:parseInt(formData.rest)
                }, 'charge');
            }
            else if(data.code == -1){
                console.log(data.msg);
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试');
        }
    })
}


//编辑商品信息请求
function editGiftInfo(sendData, itf){
    var contenttype;
    if(itf != 'onshell'){
        sendData = JSON.stringify(sendData);
        contenttype = 'application/json'
    }
    $.ajax({
        url:SERVER + 'gift/' + itf,
        headers:{
            'token':token
        },
        type:'post',
        data:sendData,
        contentType:contenttype,
        success:function(data, textStatus){
            if(data.code == 0){
                layer.msg('操作成功');
                giftListTable.reload();
            }
            else if(data.code == -1){
                console.log(data.msg);
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试');
        }
    })
}


//发布公告请求（发布公告button绑定的事件
function publishAnn(sendData){
    $.ajax({
        url:SERVER + 'news/add',
        headers:{
            'token':token
        },
        type:"post",
        data:JSON.stringify(sendData),
        contentType:'application/json',
        success:function(data, textStatus){
            if(data.code == 0){
                layer.msg('发布成功')
                annListTable.reload();
            }
            else if(data.code == -1){
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试');
        }
    })
}


//删除公告请求
function deleteAnn(annId){
    console.log(annId);
    $.ajax({
        url:SERVER + 'news/delete',
        headers:{
            'token':token
        },
        type:'post',
        data:{newsId:annId},
        success:function(data, textStatus){
            if(data.code == 0){
                layer.msg('删除成功');
                annListTable.reload();
            }
            else if(data.code == -1){
                console.log(data.msg);
                layer.alert('您的登录信息已过期，请重新登录', {title:'提示信息'}, function(){
                    clearUserLoginInfo();
                    window.location.href = '../login/login.html';
                })
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('服务器正在维护，请稍后重试')
        }
    })
}


//清空余额请求
function clearBalance(userId){
    $.ajax({
        url:SERVER + 'superAdmin/clearBalance',
        type:'get',
        data:{
            userId:userId
        },
        success:function(data, textStatus){
            layer.msg(data.info);
            userListTable.reload();
        },
        error:function(msg){
            layer.msg('清空余额失败，请稍后重试');
        }
    })
}

//获取所有用户打单记录
function getUserOrderStaticList(sendData){
    userOrderStaticList = table.render({
        elem:'#userOrderStatic',
        url:'',
        where:sendData,
        type:'',
        headers:{
            'token':token,
        },
        cols:[[
            {field:'orderId', title: '平台订单号'}
            ,{field:'userId', title: '用户ID'}
            ,{field:'username', title: '用户名'}
            ,{field:'time', title: '下单时间'}
            ,{field:'expressNum', title: '下单数量'}
            ,{field:'warehouse', title: '下单仓储'}
            ,{field:'price', title: '单价'}
            ,{field: 'totalPrice', title:'消费金额'}
        ]],
        page:true,
        tool:true,
    })
}