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
