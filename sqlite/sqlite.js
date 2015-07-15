var SQLITE_LIB = require('./build/Release/sqlite.node');

SQLITE_LIB.debug = true;

/**
 * Получить текущую версию модуля
 * @returns {SQLITE_LIB@call;c_Version}
 */
SQLITE_LIB.Version = function () {
    return this.c_Version();
};

/**
 * Соединение с базой данных (если не существует - создаст новую)
 * @param {type} filename
 * @returns {SQLITE_LIB.Connect@call;c_Connect}
 */
SQLITE_LIB.Connect = function (filename) {

    var reti = this.c_Connect(filename);

    if (!reti) {
        if (this.debug) {
            window.alert("ОШИБКА СОЕДИНЕНИЯ С БАЗОЙ ДАННЫХ " + filename);
        }
    }

    return reti;

};

/**
 * Получить ошибку
 * @type String|@exp;SQLITE_LIB@call;c_GetErr
 */
SQLITE_LIB.ErrorMsg = "";
SQLITE_LIB.Error = function () {
    this.ErrorMsg = this.c_GetErr();
    return this.ErrorMsg;
};

/**
 * Запрос в базу данных с возвратом значения (SELECT)
 * Возвратит false - при ошибке или результирующий самомтоятельный объект
 * @param {type} sql
 * @returns {SQLITE_LIB.Query@call;c_Exec}
 */
SQLITE_LIB.Result = Array();
SQLITE_LIB.Query = function (sql) {
    SQLITE_LIB.Result = Array();
    SQLITE_LIB.Result = this.c_Query(sql);
    if (!SQLITE_LIB.Result) {
        if (this.debug) {
            window.alert("ОШИБКА SQLITE3: " + this.Error());
        }
    }

    var res = function () {
        this.result = SQLITE_LIB.Result;
        this.rows_count = SQLITE_LIB.Result.length;
        this.filelds_count = 0;
        this.fields_names = Array();

        if (this.rows_count > 0) {
            // составляем массив имен полей
            var indx = 0;
            for (fx in this.result[0]) {
                this.fields_names[indx] = fx;
                indx++;
            }
            // берем количество полей
            this.filelds_count = this.fields_names.length;
        }

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



    };

    return new res();
};

// Класс создания нового запроса в базу данных
SQLITE_LIB.SQL = function () {
    this.sql = "";
    this.__isRes = true; // true - результат false - без результата

    this.__tables = []; // рабочие таблицы запроса

    // указать рабочую таблицу запроса
    this.table = function (table) {
        this.__tables = null;
        this.__tables = [];
        this.__tables[0] = table;
        return this;
    };

    // Указать рабочие таблицы в виде массива ["table1", "table2", ...., "tableN as tN"]
    this.tables = function (tables) {
        this.__tables = null;
        this.__tables = [];
        for (var ind = 0; ind < tables.length; ind++) {
            this.__tables[ind] = tables[ind];
        }
        ;
        return this;
    };


    this.__fields = [];
    // Указать основные поля запроса
    this.select = function (fields) {
        this.__isRes = true;
        this.__fields = null;
        this.__fields = fields;

        var SQL = "SELECT ";

        for (var ind = 0; ind < fields.length; ind++) {
            SQL = SQL + fields[ind];
            if (ind < fields.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        };

        SQL = SQL + "FROM ";

        for (var ind = 0; ind < this.__tables.length; ind++) {
            SQL = SQL + this.__tables[ind];
            if (ind < this.__tables.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        };
        this.sql = SQL;
        return this;

    };
    
    // Добавить к запросу WHERE ["field1=AAA", "field2>0", ......]
    this.where = function(cond){
        var SQL = "WHERE ";
        
        for (var ind = 0; ind < cond.length; ind++) {
            SQL = SQL + cond[ind];
            if (ind < cond.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        };
        this.sql = this.sql + SQL;
        return this;
    };
    
    // Добавить лимит вывода
    this.limit = function(num, end){
        var ende = end || "";
        if(ende!==""){
            ende = ","+end;
        }
        this.sql = this.sql + "LIMIT "+num+ende+" ";
        return this;
    };
    
    // ВЫПОЛНИТЬ ЗАПРОС (false - ошибка) результат при SELECT и true - при других запросах
    this.exec = function (ende) {
        var xend = ende || "";
        var res = null;
        if (this.__isRes) {
            res = SQLITE_LIB.Query(this.sql + xend);
        } else {
            res = SQLITE_LIB.Exec(this.sql + xend);
        }
        return res;
    };

};

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

module.exports = SQLITE_LIB;


