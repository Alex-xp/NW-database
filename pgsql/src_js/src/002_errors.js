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

