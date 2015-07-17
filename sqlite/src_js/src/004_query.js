// *****************************************************************************
// ПРОСТЫЕ ЗАПРОСЫ
// *****************************************************************************

/**
 * запрос в базу без возврата значения (CREATE, INSERT, UPDATE)
 * @param {type} sql
 * @returns {undefined}
 */
SQLITE_LIB.Exec = function (sql) {
    var Result = this.c_Exec(sql);
    if (!Result) {
        if (this.debug) {
            window.alert("ОШИБКА SQLITE3: " + this.Error());
        }
    }
    return Result;
};

/**
 * Запрос в базу данных с возвратом значения (SELECT)
 * Возвратит false - при ошибке или результирующий самомтоятельный объект
 * @param {type} sql
 * @returns {SQLITE_LIB.Query@call;c_Exec}
 */
SQLITE_LIB.Query = function (sql) {

    // создать объект результата
    var res = new SQLITE_LIB.RESULT();

    // получить результат
    res.result = this.c_Query(sql);
    if (!res.result) {
        if (this.debug) {
            window.alert("ОШИБКА SQLITE3: " + this.Error());
        }
    }

    // Количество строк в запросе
    res.rows_count = res.result.length;

    if (res.rows_count > 0) {
        // составляем массив имен полей
        var indx = 0;
        for (fx in res.result[0]) {
            res.fields_names[indx] = fx;
            indx++;
        }
        // берем количество полей
        res.filelds_count = res.fields_names.length;
    }
    
    return res;
};

// ЗАПРОС НА ПОЛУЧЕНИЕ ТАБЛИЦ В БАЗЕ ДАННЫХ !!!!!!!
SQLITE_LIB.GetTablesDB = function () {
    return SQLITE_LIB.Query('SELECT name FROM sqlite_master WHERE type = "table"');
};

