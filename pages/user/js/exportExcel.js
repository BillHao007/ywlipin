function exportExcel(data, filename){
    if (typeof XLSX == 'undefined') XLSX = require('xlsx');
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");
    XLSX.writeFile(wb, filename + ".xlsx");
}