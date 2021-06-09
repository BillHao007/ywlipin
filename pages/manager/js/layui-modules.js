layui.use('layer', function(){
    layer = layui.layer;
})

layui.use('element', function(){
    var element = layui.element;
    element.on('nav(sideNav)', function(ele){
        if(ele) loadUserCenterSideContent(ele);
    })
})


layui.use('table', function(){
    console.log('layui table加载')
    table = layui.table;

    //监听快递单数据表格复选框
    table.on('checkbox(expressOrderDetail)', function(obj){
        if(obj.type == 'all'){ //全选操作
            for(let i = 0; i < expressList.length; i++){
                expressList[i].LAY_CHECKED = obj.checked;
            }
        }
        else{
            expressList[obj.data.idx].LAY_CHECKED = obj.checked;
        }
    })

    //监听行内按钮事件
    table.on('tool(expressOrderDetail)', function(obj){
        var layEvent = obj.event;
        var code = obj.data.thirPartId;
        if(layEvent == 'send'){
            layer.confirm('是否确定发货', {title:'发货确认'}, function(){
                printExpressOrderDetailList(code);
            })
        }
        else if(layEvent == 'cancel'){
            layer.confirm('是否确定取消发货', {title:"取消发货确认"}, function(){
                cancelPrint(code);
            })
        }
    })

    table.on('toolbar(expressOrderDetail)', function(obj){
        var layEvent = obj.event;
        if(layEvent == 'deliver'){
            layer.confirm('是否确定发货', {title:'发货确认'}, function(){
                printExpressOrderDetailList();
            })
        }
        else if(layEvent == 'cancelDeliver'){
            layer.confirm('是否确定取消发货', {title:"取消发货确认"}, function(){
                cancelPrint();
            })
        }
    })

    //用户列表行工具栏监听
    table.on('tool(userList)', function(obj){
        var layEvent = obj.event;
        if(layEvent == 'update'){
            if(obj.data.status == '用户'){
                layer.confirm('是否确认将该用户升级成管理员', {title:'操作确认'}, function(){
                    changeUserStatus({
                        userId:obj.data.userId,
                        status:2,
                        available:1
                    }, '该账户已成为管理员');
                })
            }
            else if(obj.data.status == '管理员'){
                layer.msg('该账户已经是管理员账户');
            }
            
        }
        else if(layEvent == 'destroy'){
            if(obj.data.status !== '已注销'){
                layer.confirm('是否确认将该用户账户注销', {title:'操作确认'}, function(){
                    changeUserStatus({
                        userId:obj.data.userId,
                        status:0,
                        available:-1,
                    }, '该账户已注销');
                })
            }
            else{
                layer.msg('该账户已注销');
            }
            
        }
        else if(layEvent == 'clear'){
            layer.confirm('是否确认将该用户的账户余额清空', {title:'操作确认'}, function(){
                clearBalance(obj.data.userId);
            })
        }
    })

    //监听礼品数据表格操作栏按钮点击
    table.on('tool(giftList)', function(obj){
        var layEvent = obj.event;
        var data = obj.data;
        console.log(obj.data)
        if(layEvent == 'changePic'){
            layer.ready(function(){
                layer.open({
                    type:0,
                    title:'更换图片',
                    skin:'changePicLayer',
                    content:`<img src="${obj.data.image}" height="300px"><button type="button" class="layui-btn" lay-submit id="changeGiftPic" style="display:block"><i class="layui-icon">&#xe67c;</i>上传礼品图片</button>`,
                })
            })
            uploadPicture('#changeGiftPic', '.changePicLayer', obj.data.giftId);
        }
        else if(layEvent == 'onshell'){
            editGiftInfo({
                giftId:data.giftId,
                isOnShell:true
            }, 'onshell');
        }
        else if(layEvent == 'outshell'){
            editGiftInfo({
                giftId:data.giftId,
                isOnShell:false
            }, 'onshell');
        }
        else if(layEvent == 'del'){
            editGiftInfo({
                giftId:data.giftId,
            }, 'delete');
        }
    })


    //监听公告数据表格操作栏按钮点击
    table.on('tool(annList)', function(obj){
        var layEvent = obj.event;
        if(layEvent == 'del'){
            layer.confirm("是否确定删除此条公告？", {title:'删除确认'}, function(){
                deleteAnn(obj.data.newsId)
            })
        }
    })

    //监听礼品表单元格编辑
    table.on('edit(giftList)', function(obj){
        if(obj.field == 'rest'){
            editGiftInfo({
                giftId:obj.data.giftId,
                warehouseName:'义乌仓储',
                rest:parseInt(obj.value)
            }, 'charge');
        }
        else{
            editGiftInfo({
                giftId: obj.data.giftId,
                [obj.field]:obj.value
            }, 'update');
        }
        
    })

    //监听公告表单元格编辑
    table.on('edit(annList)', function(obj){
        editAnnInfo({
            newsId:obj.data.newsId,
            [obj.field]:obj.value
        })
    })
})

layui.use('form', function(){
    form = layui.form;

    //快递单列表筛选按钮监听事件
    form.on('submit(filterExpressBtn)', function(data){
        var formData = data.field;
        getExpressOrderDetailList(formData.filter_classify, {
            userName:formData.filter_username ? formData.filter_username : null,
            thirPartId:formData.filter_thirPartId ? formData.filter_thirPartId : null,
            expressId:formData.filter_expressId ? formData.filter_expressId : null,
            orderId:formData.filter_orderid ? formData.filter_orderid : null,
            beginTime:formData.filter_startDate ? formData.filter_startDate : null,
            endTime:formData.filter_endDate ? formData.filter_endDate : null,
            goodsName:formData.filter_goodName ? formData.filter_goodName : null,
            warehouse:getWareHouse(formData.warehouse)
        });
        return false;
    });
    
    //用户列表筛选按钮监听事件
    form.on('submit(searchUser)', function(data){
        getUserList(data.field.search_userId);
        return false;
    });

    //礼品列表筛选按钮监听事件
    form.on('submit(filter_gift)', function(data){
        var formData = data.field;
        getGiftList(formData.status, {
            warehouse:getWareHouse(parseInt(formData.warehouse)),
        });
        return false;
    });
    //公告列表筛选按钮监听事件
    form.on('submit(filter_ann)', function(data){
        var formData = data.field;
        getAnnList({
            publishTime:formData.date ? formData.date + ' 00:00:00': null,
        });
        return false;
    });

    //监听添加商品按钮
    form.on('submit(addGift)', function(data){
        var formData = data.field;
        addGift({
            giftName:formData.giftName,
            image:$('.uploadPicBox img').attr('src'),
            price:parseInt(formData.price),
            weight:parseFloat(formData.weight)
        }, formData);
        return false;
    });

    //监听发布公告按钮点击
    form.on('submit(publishAnn)', function(data){
        var formData = data.field;
        publishAnn({
            title:formData.title,
            publisher:$.cookie('username'),
            content:formData.content,
            type:formData.type == 1 ? true : false
        })
        
        return false;
    })
})