$(function(){
    initUserLoginInfo();
    layui.use('element', function(){
        var element = layui.element;
    })
    
    getAnnList(true, 1, true);
    getAnnList(false, 1, true);
})


function getAnnList(annType, pageNum, isRender){
    var totalPage;
    $.ajax({
        url:SERVER + 'news/select',
        type:"get",
        data:{
            pageNum:pageNum,
            pageSize:10,
            type:annType
        },
        success:function(data, textStatus){
            if(data.code == 0){
                if(annType){
                    if(isRender){
                        layui.use('laypage', function(){
                            var laypage = layui.laypage;
                            laypage.render({
                                elem:"ann-divPage",
                                limit:10,
                                count:data.count,
                                jump:function(obj, first){
                                    if(!first) getAnnList(true, obj.curr, false);
                                }
                            });
                        })
                    }
                    loadAnnList(data.data, '#annList');
                }
                else{
                    if(isRender){
                        layui.use('laypage', function(){
                            var laypage = layui.laypage;
                            laypage.render({
                                elem:"help-divPage",
                                limit:10,
                                count:data.count,
                                jump:function(obj, first){
                                    if(!first) getAnnList(false, obj.curr, false);
                                }
                            })
                        })
                    }
                    
                    loadAnnList(data.data, '#helpList');
                }
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('获取公告信息失败，请稍后尝试')
        }
    })
    return totalPage;
}

function loadAnnList(annList, selector){
    $(selector).children().remove();
    if(annList.length == 0){
        $(selector).append('<div class="empty-tip">暂无数据</div>')
    }
    for(let i = 0; i < annList.length; i++){
        let ann = annList[i];
        let content = `<li class="ann-item ann-item${i}">
                            <a href="../announcement/announcement.html?annId=${ann.newsId}" class="ann-title">${ann.title}</a>
                            <span class="time">${ann.publishTime}</span>
                       </li> `;
        $(selector).append($(content));
    }
}