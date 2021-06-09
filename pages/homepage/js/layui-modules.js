layui.use('element', function(){
    var element = layui.element;
    element.on('tab(warehouseTab)',function(data){
        var warehouse = getWareHouse(data.index)
        getGiftList(warehouse, 1);
    })
});