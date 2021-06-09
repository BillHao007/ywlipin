var SERVER = 'http://zhangxt955.natapp1.cc/';   //服务器地址
var FIRSTCLICK = [0, 0, 0, 0, 0, 0];   //记录用户中心界面侧栏是否是第一次点击


var form;
var layer;
var table;

var fileList = {};  //记录上传的文件对象集
var orderList = []; //记录上传的订单集合
var gift;  //购买的礼物对象
var cityArray = []  //上传的表格订单地址列表
var fileItemRange = {}

var expPriceList = [0.00]  //idx:0 未选择 idx:1 义乌仓储


var PAYTOOL = ['支付宝'];
var SHIPPER = ['韵达快递'];