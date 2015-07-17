// *****************************************************************************
// ПРОСТЫЕ ЗАПРОСЫ
// *****************************************************************************

/**
 * запрос в базу без возврата значения (CREATE, INSERT, UPDATE)
 * @param {type} sql
 * @returns {undefined}
 */
PGSQL_LIB.Exec = function (sql) {
    this.c_Query(sql);
    if (this.isError()) {
        return false;
    } else {
        return true;
    }
};

/**
 * Запрос в базу данных с возвратом значения (SELECT)
 * Возвратит false - при ошибке или результирующий самомтоятельный объект
 * @param {type} sql
 * @returns {PGSQL_LIB.Query@call;c_Exec}
 */
PGSQL_LIB.Query = function (sql) {
    // получить результат
    PGSQL_LIB.c_Query(sql);
    if (PGSQL_LIB.isError()) {
        return false;
    }

    // создать объект результата
    var res = new PGSQL_LIB.RESULT();

    var rc = PGSQL_LIB.c_rows_count();
    var fc = PGSQL_LIB.c_fields_count();

    // заполняем результат
    for (var rcx = 0; rcx < rc; rcx++) {
        var obj = new Object();
        for (var fcx = 0; fcx < fc; fcx++) {
            obj[PGSQL_LIB.c_getFName(fcx)] = PGSQL_LIB.c_get(rcx, fcx);
        }
        res.result[rcx] = obj;
    }

    // Количество строк в запросе
    res.rows_count = rc;

    // Количество полей в запросе
    res.filelds_count = fc;

    res.fields_names = Array();
    for (var fcx = 0; fcx < fc; fcx++) {
        res.fields_names[fcx] = PGSQL_LIB.c_getFName(fcx);
    }
    
    return res;
};

// ЗАПРОС НА ПОЛУЧЕНИЕ ТАБЛИЦ В БАЗЕ ДАННЫХ !!!!!!!
//PGSQL_LIB.GetTablesDB = function () {
//    return PGSQL_LIB.Query('SELECT name FROM sqlite_master WHERE type = "table"');
//};

