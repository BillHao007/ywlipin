function onpurchaseBtnClick(data){
    var formData = data.field;
    cityArray = [];
    if($.isEmptyObject(gift)){
        layer.msg('未选择礼品')
        return false;
    }
    
    if($.isEmptyObject(fileList) && formData.address == ''){
        layer.msg('未填写或导入收货地址')
        return false;
    }

    if(formData.address){  //解析输入框中的地址
        let addList = formData.address.split('\n');
        console.log(addList);
        for(let i = 0; i < addList.length; i++){
            let addItem  = addList[i].split(' ');
            console.log(addItem);
            if(addItem.length < 7){
                layer.msg('手动录入收件人信息填写格式有误');
                return false;
            }
            orderList.push({
                '订单编号':addItem[0],
                '收货人姓名':addItem[1],
                '联系手机':addItem[2],
                '收货地址':addItem[3]+' '+addItem[4]+' '+addItem[5]+' '+addItem[6],
                '修改后的收货地址':'null'
            })
        }
    }
    
    var buyerAdd;
    for(let i = 0; i < orderList.length; i++){
        let order = orderList[i]
        if(order['修改后的收货地址'] !== 'null'){
            buyerAdd = order['修改后的收货地址']
        }
        else{
            buyerAdd = order['收货地址']?order['收货地址']:order['收货地址 '];
        }
        if(buyerAdd){
            if(buyerAdd.indexOf('新疆') !== -1 || buyerAdd.indexOf('西藏') !== -1){
                continue;
            }
            // if(!placeArr[0] || !placeArr[1] || !placeArr[2] || !placeArr[3]){
            //     layer.msg('表格数据出错，请检查格式');
            // }
            let placeArr = buyerAdd.split(' ')
            let str = placeArr[0] + placeArr[1] + placeArr[2];
            let len = str.length + 3;
            let addDetail = buyerAdd.substring(len, buyerAdd.length);
            cityArray.push({
                province:placeArr[0],
                city:placeArr[1],
                expArea:placeArr[2],
                address:addDetail.replace(/\s/g, '')
            });
        }
        else{
            layer.msg('表格数据出错，请检查格式');
            return false;
        }
    }
    prePurchase(parseInt(formData.yard));
    return false;
}