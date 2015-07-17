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

