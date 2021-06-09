$(function(){
    initUserLoginInfo();
    layui.use('layer', function(){
        var layer = layui.layer;
    })

    getGiftList(null);
    getAnnList(true);
    getAnnList(false);
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
        gift.rest = rest
        sesstionStorage.setItem('gift', JSON.stringify(gift));
        window.location.href = '../user/user.html?data-no=1'
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
            <div class="card" data-index="${i}">
                <div class="good-img" style="background:url(${gift.image});"></div>
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

function loadAnnList(annList, selector){
    if(annList.length == 0){
        $(selector).append('<div class="empty-tip">暂无数据</div>')
    }
    for(let i = 0; i < annList.length; i++){
        let ann = annList[i];
        let content = `<li class="item item${i}">
                            <a href="../announcement/announcement.html?annId=${ann.newsId}" class="title">${ann.title}</a>
                            <span class="time">${ann.publishTime}</span>
                       </li> `;
        $('.notice-area '+ selector +' .board-content').append($(content));
    }
}