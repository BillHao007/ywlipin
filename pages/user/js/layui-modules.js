// layui.config({
//     base: '../../frame/mods/'
//     , version: '1.0'
// });

layui.use('layer', function(){
    layer = layui.layer
})

layui.use('element', function(){
    var element = layui.element;

    element.on('nav(sideNav)', function(ele){
        if(ele)
        loadUserCenterSideContent(ele);
    })

    $('#change-amount').find('input').removeAttr('readOnly')   //输入金额既可以选择也可以输入
});

layui.use('table', function(){
    table = layui.table;
    table.on('tool(orderList)', function(obj){
        var layEvent = obj.event;
        var orderId = obj.data.orderId
        if(layEvent == 'seeDetail'){
            window.location.href = 'user.html?data-no=3&orderid='+orderId;
        }
    })
})

layui.use('form', function(){
    form = layui.form;
    form.verify({

        yard:function(value, item){
            if(!value){
                return '请选择仓储';
            }
        },

        chargeNumber:function(value, item){
            var chargeNum = document.getElementById('record-charge-num').value
            if(!chargeNum){
                return '请输入充值金额'
            }
        },
        chargeWay:function(value, item){
            if(!value){
                return '请选择充值方式'
            }
        },

        newpassword:[
            /^[\S]{4,20}$/
            ,'密码必须4到20位，且不能出现空格'
        ],

        passagain:function(value, item){
            var newpassword = $(item).parents('.layui-form-item').prev().find('[name=newPass]').val();
            if(newpassword !== value){
                return '两次的密码不一致'
            }
        }
    })

    //预下单按钮监听事件
    form.on('submit(purchaseBtn)', function(data){
        return onpurchaseBtnClick(data);
    })

    //下单按钮监听事件
    form.on('submit(payBtn)', function(data){
        
        parseFloat($('#cost').text().replace('￥', '')) <= parseFloat($('#rest').text().replace('￥', '')) 
            ? payBtn(data.field) : layer.alert('您的余额不足，请前往充值', {title:'提示信息'})
        return false;
    })

    //充值按钮监听事件
    form.on('submit(recharge)', function(data){
        var chargeNumber = document.getElementById('record-charge-num').value
        preCharge(parseFloat(chargeNumber).toFixed(2), data.field.chargeWay, layer.load(1))
        return false;
    })

    //获取快递单列表筛选按钮监听事件
    form.on('submit(searchExpressDetail)', function(data){
        let formData = data.field
        getOrderDetail({
            orderId:formData.filter_orderid ? formData.filter_orderid : null,
            thirPartId:formData.filter_thirPartId ? formData.filter_thirPartId : null,
            expressId:formData.filter_expressId ? formData.filter_expressId : null,
            beginTime:formData.filter_startDate ? formData.filter_startDate : null,
            endTime:formData.filter_endDate ? formData.filter_endDate : null,
            deliver: (val => {if(val == 0) return null; else if(val == 1) return false; else return true;})(formData.filter_classify)
        });
        return false;
    })

    //获取平台订单列表筛选按钮监听事件
    form.on('submit(searchOrderDetail)', function(data){
        let formData = data.field;
        getOrderList({
            orderId:formData.orderid ? formData.orderid : null,
            beginTime:formData.startDate ? formData.starDate : null,
            endTime:formData.endDate ? formData.endDate : null,
        })
        return false;
    })

    //修改支付密码按钮监听事件
    form.on('submit(updatePayPass)', function(data){
        updatePassword(data.field, '支付密码', 'password/updatePayPassword');
        return false;
    })
})

