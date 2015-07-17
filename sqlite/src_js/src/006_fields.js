// *****************************************************************************
// ТИПЫ ДАННЫХ ПОЛЕЙ И ОПИСАНИЕ ПОЛЯ
// *****************************************************************************

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

// КОНСТРУКТОР ОПИСАНИЯ ПОЛЯ ПРИ СОЗДАНИИ ТАБЛИЦЫ CREATE
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

