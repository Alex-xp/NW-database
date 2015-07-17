// *****************************************************************************
// РЕЗУЛЬТАТ
// *****************************************************************************
PGSQL_LIB.RESULT = function () {
    this.result = Array();
    this.rows_count = 0;
    this.filelds_count = 0;
    this.fields_names = Array();

    // Получить значение поля по имени
    this.getForName = function (row, fName) {
        return this.result[row][fName];
    };

    // Получить значение поля по индексам
    this.get = function (row, col) {
        var fName = this.fields_names[col];
        return this.result[row][fName];
    };

    // получить имя поля
    this.getFName = function (col) {
        return this.fields_names[col];
    };
    
    return this;

};



