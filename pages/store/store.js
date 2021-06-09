var SERVER = 'http://zhangxt955.natapp1.cc/';
var layer, laypage;

var giftList = [
    {giftid:0,name:'精美榨汁机',image:'2.jpg', price:2.5},
    {giftid:1,name:'猫耳风扇',image:'3.jpg',price:2.5},
    {giftid:2,name:'送女孩子最好的礼物',image:'4.jpg',price:2.5},
    {giftid:3,name:'化妆镜/小风扇',image:'5.jpg',price:2.5}
]

$(function(){
    initUserLoginInfo();
    layui.use('layer', function(){
        layer = layui.layer;
    })

    layui.use('laypage', function(){
        laypage = layui.laypage
    })

    layui.use('element', function(){
        var element = layui.element;
        element.on('tab(warehouseTab)',function(data){
            var warehouse = getWareHouse(data.index)
            console.log(warehouse);
            getGiftList(warehouse, 1, true);
        })
    });

   getGiftList(null, 1, true)
})


function getWareHouse(status){
    switch(status){
        case 0: return null;
        case 1: return '义乌仓储';
    }
}

function selectGood(){
    $('.button').click(function(){
        var idx = $(this).parents('.card').data('index');
        var rest = $(this).prev().text();
        rest = rest.substring(3, rest.length - 1);
        var gift = giftlist[parseInt(idx)];
        gift.rest = rest;
        sesstionStorage.setItem('gift', JSON.stringify(gift));
        window.location.href = '../user/user.html?data-no=1'
    })
}

function getGiftList(ware, pageNum, isRender){
    $.ajax({
        url:SERVER + 'gift/select',
        type:'get',
        data:{
            pageNum:pageNum,
            pageSize:16,
            warehouse:ware,
            status:true
        },
        success:function(data, textStatus){
            console.log(data);
            if(data.code == 0){
                if(isRender){
                    laypage.render({
                        elem:'good-divPage',
                        limit:16,
                        count:data.count,
                        jump:function(obj, first){
                            if(!first) getGiftList(null, obj.curr,false);
                        }
                    })
                }
                loadGiftCard(data.data);
                selectGood();
            }
        },
        error:function(msg){
            layer.msg('获取商品列表失败，服务器正在维护，请稍后重试')
        }
    })
}

function loadGiftCard(giftList){
    var showTab = $('.goods .layui-tab-content .layui-show');
    showTab.children().remove();
    if(giftList.length == 0){
        showTab.append('<div class="empty-tip">暂无数据</div>')
    }
    for(let i = 0; i < giftList.length; i++){
        let gift = giftList[i];
        let rest = 0;
        for(let j = 0; j < gift.giftRestList.length; j++){
            rest += gift.giftRestList[j].rest
        }
        let row;
        let content = `
            <div class="card" data-giftid="${i}">
                <div class="good-img" style="background:url('../../images/gift/${gift.image}');"></div>
                <div class="good-info">
                    <div class="good-data"><span class="price">￥${gift.price}</span><span class="weight">${gift.weight}千克/件</span></div>
                    <p class="good-title">${gift.giftName}</p>
                    <span class="good-rest">库存：${rest}件</span>
                    <div class="button">立即购买</span>
                </div>
            </div>
        `;
        if(i % 4 == 0){
            row = $('<div class="row row'+ parseInt(i / 4) + '"></div>');
            row.appendTo(showTab);
            row.append($(content));
        }
        else{
            $(content).appendTo($('.row'+parseInt(i / 4)));
        }
    }
}

function loadDivPage(warehouse, pageNum){
    var totalPage = getGiftList(warehouse, pageNum);
    
}