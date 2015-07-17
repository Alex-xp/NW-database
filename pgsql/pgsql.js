// *****************************************************************************
// ОПРЕДЕЛЕНИЕ МОДУЛЯ И СОЕДИНЕНИЕ
// *****************************************************************************

/* 
 * Загрузка бинарной части модуля .node
 */
var PGSQL_LIB = require('./build/Release/pgsql_lib.node');

/**
 * Получить текущую версию бинарной части модуля
 */
PGSQL_LIB.Version = function () {
    return this.c_Version();
};

// Флажок соединения
PGSQL_LIB.conn = false;

// строка соединения типа: "dbname=test_base host=localhost port=5432 user=postgres password=000000"
PGSQL_LIB.conn_string = "dbname=base host=localhost port=5432 user=postgres password=my_password";

/**
 * Соединение с базой данных (если не существует - создаст новую)
 * "dbname=test_base host=localhost port=5432 user=postgres password=000000"
 */
PGSQL_LIB.Connect = function(conn_string){
    var cstr = conn_string || PGSQL_LIB.conn_string;
    if (this.c_Connect(cstr)){
        this.conn = true;
        return true;
    }else{
        if(this.debug){window.alert("НЕ МОГУ СОЕДИНИТСЯ С БАЗОЙ");}
        this.conn = false;
        return false;
    }
};

// Разрыв соединения с базой данных
PGSQL_LIB.Close = function(){
    if(this.conn){
        this.c_Close();
        this.conn = false;
    }
};
// *****************************************************************************
// СООБЩЕНИЯ ОБ ОШИБКАХ
// *****************************************************************************

// ОТЛАДКА (вывод сообщений ошибок через alert(ОШИБКА) )
PGSQL_LIB.debug = true;

/**
 * Получить ошибку
 * @type String|@exp;PGSQL_LIB@call;c_GetErr
 */
PGSQL_LIB.ErrorMsg = "";
PGSQL_LIB.Error = function(){
    this.ErrorMsg = "";
    if (this.c_isError() !== false) {
        this.ErrorMsg = this.c_ErrorMsg();
        if(this.debug){ window.alert(this.ErrorMsg);}
        return this.c_ErrorMsg();
    }else{
        return "";
    }
};
PGSQL_LIB.isError = function(){
    if(this.c_isError()){
        this.Error();
    }
    return this.c_isError();
};


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


// *****************************************************************************
// КОНСТРУКТОР УСЛОВИЙ ЗАПРОСОВ
// *****************************************************************************

// cond = "aa=bb"
PGSQL_LIB.WHERE = function (cond) {
    this.__where = "" + cond;

    this.ins = function (cond) {
        this.__where = this.__where + "(" + cond + ") ";
        return this;
    };

    this.add = function (str) {
        this.__where = this.__where + str;
        return this;
    };
    this._AND = function () {
        this.__where = this.__where + " AND ";
        return this;
    };
    this._OR = function () {
        this.__where = this.__where + " OR ";
        return this;
    };
    this._XOR = function () {
        this.__where = this.__where + " XOR ";
        return this;
    };
    this._LIKE = function () {
        this.__where = this.__where + " LIKE ";
        return this;
    };

    this.insAND = function (wh) {
        this.__where = this.__where + " AND(" + wh.__where + ") ";
        return this;
    };
    this.insOR = function (wh) {
        this.__where = this.__where + " OR(" + wh.__where + ") ";
        return this;
    };
    this.insXOR = function (wh) {
        this.__where = this.__where + " XOR(" + wh.__where + ") ";
        return this;
    };
    this.insLIKE = function (wh) {
        this.__where = this.__where + " LIKE(" + wh.__where + ") ";
        return this;
    };

    this.AND = function (cond) {
        this.__where = this.__where + " AND " + cond + " ";
        return this;
    };

    this.OR = function (cond) {
        this.__where = this.__where + " OR " + cond + " ";
        return this;
    };

    this.XOR = function (cond) {
        this.__where = this.__where + " XOR " + cond + " ";
        return this;
    };
    this.LIKE = function (column, cond) {
        this.__where = this.__where + " " + column + " LIKE %" + cond + "% ";
        return this;
    };


    return this;

};




// *****************************************************************************
// ТИПЫ ДАННЫХ ПОЛЕЙ И ОПИСАНИЕ ПОЛЯ
// *****************************************************************************

PGSQL_LIB.F_TEXT = "TEXT ";
PGSQL_LIB.F_INT = "INTEGER ";
PGSQL_LIB.F_PK = "PRIMARY KEY ";
PGSQL_LIB.F_NUM = "NUMERIC ";
PGSQL_LIB.F_FLOAT = "REAL ";
PGSQL_LIB.F_UNIQUE = "UNIQUE ";
PGSQL_LIB.F_NONE = "NONE ";
PGSQL_LIB.F_ASC = "ASC ";
PGSQL_LIB.F_DESC = "DESC ";
PGSQL_LIB.F_NOT_NULL = "NOT NULL ";

// КОНСТРУКТОР ОПИСАНИЯ ПОЛЯ ПРИ СОЗДАНИИ ТАБЛИЦЫ CREATE
PGSQL_LIB.FIELD = function (data) {
    this.fname = data.name || "noName";
    this.type = "";
    if (data.type === undefined) {
        this.type = "";
    } else {
        this.type = " " + data.type;
    }

    this.__getSQL = function () {
        return this.fname + this.type;
    };
    return this;
};


// *****************************************************************************
// КОНСТРУКТОР ЗАПРОСА
// *****************************************************************************/* 
 
PGSQL_LIB.SQL = function () {
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

    // Создать запрос к таблицам SELECT
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
        }
        ;

        SQL = SQL + "FROM ";

        for (var ind = 0; ind < this.__tables.length; ind++) {
            SQL = SQL + this.__tables[ind];
            if (ind < this.__tables.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        }
        ;
        this.sql = SQL;
        return this;
    };

    // Запрос на создание таблицы
    // fdata = [new PGSQL_LIB.FIELD({"name":"fieldName", "type":PGSQL_LIB.F_TEXT})]
    this.create = function (fdata, ne) {
        this._NE = "";
        if(ne!==undefined && ne!==false)this._NE = "IF NOT EXISTS ";
        this.__isRes = false;
        var SQL = "CREATE TABLE " + this._NE;
        for (var ind = 0; ind < this.__tables.length; ind++) {
            SQL = SQL + this.__tables[ind];
            if (ind < this.__tables.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        }

        SQL = SQL + "(";

        if (typeof fdata === 'string') {
            SQL = SQL + fdata;
        } else {
            for (var ind = 0; ind < fdata.length; ind++) {
                SQL = SQL + fdata[ind].__getSQL();
                if (ind < fdata.length - 1) {
                    SQL = SQL + ",";
                }
                SQL = SQL + " ";
            }
        }
        SQL = SQL + ")";

        this.sql = SQL;
        return this;
    };
    
    //УДАЛЕНИЕ ТАБЛИЦЫ
    this.drop_table = function(tname, ne){
        this._NE = "";
        if(ne!==undefined && ne!==false)this._NE = "IF EXISTS ";
        
        this.sql = "DROP TABLE " + this._NE + tname;
        
        return this;
    };
    
    // Добавление данных с корректировкой символа ' на &#39;
    // data {"fname":"value"} или SQL
    this.insert = function (data) {
        this.__isRes = false;
        
        var SQL = "INSERT INTO ";
        for (var ind = 0; ind < this.__tables.length; ind++) {
            SQL = SQL + this.__tables[ind];
            if (ind < this.__tables.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        }
        
        if(typeof data ==='string'){
            SQL = data;
        }else{
            SQL = SQL + "(";
            var pp = 0;
            for(var fname in data){
                if(pp>0)SQL = SQL + ", ";
                SQL = SQL + fname;
                pp++;
            }
            SQL = SQL + ") VALUES (";
            
            var pp = 0;
            for(var fname in data){
                if(pp>0)SQL = SQL + ", ";
                SQL = SQL + "'"+data[fname].replace(/'/g, "&#39;")+"'";
                pp++;
            }
            SQL = SQL + ")";
        }
        
        this.sql = SQL;
        return this;
    };

    // создать запрос на обновление данных в таблице 
    // sets = объект {"поле":"данные", "поле2":"данные2", .... }
    this.update = function (sets) {
        this.__isRes = false;
        var SQL = "UPDATE ";
        for (var ind = 0; ind < this.__tables.length; ind++) {
            SQL = SQL + this.__tables[ind];
            if (ind < this.__tables.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        }
        ;

        var SQL = SQL + "SET ";

        var nts = 0;
        for (fx in sets) {
            if (nts > 0) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
            SQL = SQL + fx + "='" + sets[fx].replace(/'/g, "&#39;") + "'";
            nts++;
        }
        SQL = SQL + " ";

        this.sql = SQL;
        return this;
    };

    // Добавить к запросу WHERE "field1=AAA"
    this.where = function (cond) {
        var SQL = "";
        if (typeof cond === "string") {
            SQL = "WHERE " + cond + " ";
        } else {
            SQL = "WHERE " + cond.__where;
        }

        //console.log("COND=== ", typeof cond);

        this.sql = this.sql + SQL;
        return this;
    };

    // Добавить лимит вывода
    this.limit = function (num, end) {
        var ende = end || "";
        if (ende !== "") {
            ende = "," + end;
        }
        this.sql = this.sql + "LIMIT " + num + ende + " ";
        return this;
    };

    // Добавить в SQL запрос ORDER BY
    this.order_by = function (order) {
        var SQL = "ORDER BY ";
        for (var ind = 0; ind < order.length; ind++) {
            SQL = SQL + order[ind];
            if (ind < order.length - 1) {
                SQL = SQL + ",";
            }
            SQL = SQL + " ";
        }
        this.sql = this.sql + SQL;
        return this;
    };

    // ВЫПОЛНИТЬ ЗАПРОС (false - ошибка) результат при SELECT и true - при других запросах
    this.exec = function (ende) {
        var xend = ende || "";
        var res = null;
        if (this.__isRes) {
            res = PGSQL_LIB.Query(this.sql + xend);
        } else {
            res = PGSQL_LIB.Exec(this.sql + xend);
        }
        return res;
    };

};

// *****************************************************************************
// ЭКСПОРТИРУЕМ МОДУЛЬ
// *****************************************************************************

module.exports = PGSQL_LIB;
