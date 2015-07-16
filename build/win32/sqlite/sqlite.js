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

SQLITE_LIB.GetTablesDB = function () {
    return SQLITE_LIB.Query('SELECT name FROM sqlite_master WHERE type = "table"');
};

// КЛАСС УСЛОВИЙ
// cond = "aa=bb"
SQLITE_LIB.WHERE = function (cond) {
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

// ТИПЫ ДАННЫХ ПОЛЕЙ
SQLITE_LIB.F_TEXT = "TEXT ";
SQLITE_LIB.F_INT = "INTEGER ";
SQLITE_LIB.F_PK = "PRIMARY KEY ";
SQLITE_LIB.F_NUM = "NUMERIC ";
SQLITE_LIB.F_FLOAT = "REAL ";
SQLITE_LIB.F_UNIQUE = "UNIQUE ";
SQLITE_LIB.F_NONE = "NONE ";
SQLITE_LIB.F_ASC = "ASC ";
SQLITE_LIB.F_DESC = "DESC ";
SQLITE_LIB.F_NOT_NULL = "NOT NULL ";

SQLITE_LIB.FIELD = function (data) {
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
    // fdata = [new SQLITE_LIB.FIELD({"name":"fieldName", "type":SQLITE_LIB.F_TEXT})]
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
            res = SQLITE_LIB.Query(this.sql + xend);
        } else {
            res = SQLITE_LIB.Exec(this.sql + xend);
        }
        return res;
    };

};



module.exports = SQLITE_LIB;


