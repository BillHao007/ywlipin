function seeDetailBind(){
    $('.op-see-detail').click(function(){
        var orderid = $(this).parent().parent().find('.order-id').text();
        window.location.href='user.html?data-no=3&orderId='+orderid;
    })
}

