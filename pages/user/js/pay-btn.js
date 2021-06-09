function payBtn(data){
    var loadlayer = layer.load(1);
    let expressList = []
    for(let i = 0; i < orderList.length; i++){
        let order = orderList[i];
        let phone = order['联系手机']?order['联系手机']:order['联系手机 '];
        let tel = order['联系电话 ']?['联系电话 ']:order['联系电话'];
        let resultPhone = phone?phone.match(/\d/g).join(''):tel.match(/\d/g).join('');
        expressList.push({
            thirPartId:order['订单编号'],
            name:order['收货人姓名'],
            phone:resultPhone,
            province:cityArray[i].province,
            city:cityArray[i].city,
            expArea:cityArray[i].expArea,
            address:cityArray[i].address
        })
    }
    var sendData = {
        payPassword:data.paypass,
        warehouse:$('#wrapper-pay-confirm').data('warehouse'),
        giftId:gift.giftId,
        expressArray:expressList
    }
    $('.pay-btn').attr('disabled', 'disabled').addClass('layui-btn-disabled');
    purchaseRightNow(sendData, loadlayer);
}