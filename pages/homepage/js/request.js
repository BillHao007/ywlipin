function getGiftList(ware){
    $.ajax({
        url:SERVER + 'gift/select',
        type:'get',
        data:{
            pageNum:1,
            pageSize:8,
            warehouse:ware,
            status:true
        },
        success:function(data, textStatus){
            if(data.code == 0){
                giftlist = data.data;
                loadGiftCard(data.data);
                selectGood();
            }
        },
        error:function(msg){
            layer.msg('获取商品列表失败，服务器正在维护，请稍后重试')
        }
    })
}

function getAnnList(annType){
    $.ajax({
        url:SERVER + 'news/select8news',
        type:'get',
        data:{
            type:annType
        },
        success:function(data, textStatus){
            if(data.code == 0){
                if(annType){
                    loadAnnList(data.data, '.announcement');
                }
                else{
                    loadAnnList(data.data, '.help');
                }
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('获取公告列表失败，服务器正在维护，请稍后重试')
        }
    })
}