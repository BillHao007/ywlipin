//读取并将excel表格解析为json
function readExcelSheet(file){
    var reader = new FileReader();
    var workbook
	reader.onload = function(e) {
        var data = e.target.result;
        workbook = null;
        if (isCSV) {  //处理csv中文乱码方法
            data = new Uint8Array(data);
            let f = isUTF8(data);
            if (f) {
                data = e.target.result;
            }else {
                var str = cptable.utils.decode(936, data);
                workbook = XLSX.read(str, { type: "string" });
            }
        }
        if(!workbook){
            workbook =  XLSX.read(data, { type: 'binary' });
        }
        workbook.SheetNames.forEach(function(sheetName) {
            var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            fileItemRange[file.name] = [XL_row_object[0], XL_row_object.length];
            if (XL_row_object.length > 0){
                for(let i = 0; i < XL_row_object.length; i++){
                    orderList.push(XL_row_object[i]); //将解析后的每条记录对象压入订单数组
                }
            }
        })
    };
    isCSV = file.name.split(".").reverse()[0] == "csv";//判断是否是 CSV
    reader.onerror = function(event) {
        layer.msg('您上传的文件' + file.name + '不能被读取')
    }
    if(isCSV){
        reader.readAsArrayBuffer(file);
    }
    else{
        reader.readAsBinaryString(file);
    }
}