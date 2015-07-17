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