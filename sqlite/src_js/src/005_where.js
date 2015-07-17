// *****************************************************************************
// КОНСТРУКТОР УСЛОВИЙ ЗАПРОСОВ
// *****************************************************************************

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



