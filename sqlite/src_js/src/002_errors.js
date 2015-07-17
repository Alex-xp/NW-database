// *****************************************************************************
// СООБЩЕНИЯ ОБ ОШИБКАХ
// *****************************************************************************

// ОТЛАДКА (вывод сообщений ошибок через alert(ОШИБКА) )
SQLITE_LIB.debug = true;

/**
 * Получить ошибку
 * @type String|@exp;SQLITE_LIB@call;c_GetErr
 */
SQLITE_LIB.ErrorMsg = "";
SQLITE_LIB.Error = function () {
    this.ErrorMsg = this.c_GetErr();
    return this.ErrorMsg;
};

