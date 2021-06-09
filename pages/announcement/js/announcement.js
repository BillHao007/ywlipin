$(function(){
    initUserLoginInfo();
    var annId = getUrlPara('annId');
    getAnn(annId);
    loadSiteTree(true);
    loadSiteTree(false);
})

function getAnn(annId){
    $.ajax({
        url:SERVER + 'news/getNewsById',
        type:'get',
        data:{newsId:annId},
        success:function(data, textStatus){
            if(data.code == 0){
                $('.site-content .site-h1').text(data.data.title);
                $('.site-content .site-h3').text(data.data.publishTime);
                $('.site-content .site-text').text(data.data.content);
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('获取公告内容失败，请稍后尝试');
        }
    })
}

function loadSiteTree(annType){
    $.ajax({
        url:SERVER + 'news/select8news',
        type:'get',
        data:{
            type:annType
        },
        success:function(data, textStatus){
            if(data.code == 0){
                let list = data.data;
                if(annType){
                    for(let i = 0; i < list.length; i++){
                        $('#annList .site-tree-noicon:eq('+ i +')')
                            .append('<a href="announcement.html?annId=' + list[i].newsId + '">' + list[i].title + '</a>')
                    }
                }
                else{
                    for(let i = 0; i < list.length; i++){
                        $('#helpList .site-tree-noicon:eq('+ i +')')
                            .append('<a href="announcement.html?annId=' + list[i].newsId + '">' + list[i].title + '</a>')
                    }
                }
            }
            else{
                layer.msg(data.msg);
            }
        },
        error:function(msg){
            layer.msg('获取侧栏内容失败，请稍后尝试');
        }
    })
}

