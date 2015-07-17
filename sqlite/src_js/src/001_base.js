/* 
 * Загрузка бинарной части модуля .node
 */
var SQLITE_LIB = require('./build/Release/sqlite.node');

/**
 * Получить текущую версию бинарной части модуля
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