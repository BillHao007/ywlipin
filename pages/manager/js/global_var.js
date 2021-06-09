var SERVER = 'http://zhangxt955.natapp1.cc/';
var FIRSTCLICK = [0, 0, 0, 0, 0];

var form, layer, table;

var divPageInfo = {
    count:0,
    index:0,
    limit:0
};

var codeArray = []; // 勾选的发货快递单列表
var cancelCodeArray = []; //勾选的取消快递单列表

var expressList = [];//全部快递单