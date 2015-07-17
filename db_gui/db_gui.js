DB_GUI = {};

// Класс описания ячейки таблицы
DB_GUI.TD = function () {
    // ЗАГОЛОВОК
    this.title = null;
    this.thClass = "dbguiTD";
    
    // Если создаем пустую ячейку = обязательно необходимо добавить сюда код html с её содержимым
    this.data = null;
    
    this._FName = null;
    this._FIndex = null;
    
    // ЯЧЕЙКА
    this.cssClass = "dbguiTD";
    
    // ЩЕЛЧЕК ПО СОДЕРЖИМОММУ В ЯЧЕЙКЕ
    // Передать имя функции в строке (только имя) Параметр = id записи (table.IDKey = "name")
    this.onClick = null; // В ТАБЛИЦЕ УКАЗАТЬ ПОЛЕ КЛЮЧА ЗАПРОСА (идентификатор) В СВОЙСТВЕ IDKey
    this.cssClickClass = "dbguiTDCC"; // css класс обертки 
    this.cssClickStyle = "cursor:pointer;"; // css стиль обертки
    // Обертка действия onClick
    this.clickWrap = '<span onclick="{.onClick.}" class="{.class.}" style="{.style.}" >{.data.}</span>';
    // Обработчик щелчка в ячейке
    this._onClick = function (data, uid) {
        var reti = this.clickWrap.replace("{.onClick.}", this.onClick + "('"+uid+"')");
        reti = reti.replace("{.class.}", this.cssClickClass);
        reti = reti.replace("{.style.}", this.cssClickStyle);
        reti = reti.replace("{.data.}", data);
        
        
        
        //console.log("_onClick = ", reti);
        
        return reti;
    };
    
    // ВЫБОР ФЛАЖКОВ - МНОЖЕСТВЕННЫЙ ВЫБОР СОДЕРЖИМОГО ПО ФЛАЖКАМ
    this.onSelect = null;
    
    
    
    // Отрисовка данных
    this._renData = function(data, uid){
        var reti = data;
        if(this.data!==null){
            reti = this.data;
            // ВНИМАНИЕ !!! (для своих функций в содержимом this.data)
            // {#.uid.#} - заменяется на uid строки ко ключу table.IDKey
            reti = reti.replace(/({#.uid.#})/g, uid);
        }
        
        // Если есть функция клика по содержимому
        if(this.onClick !== null){
            reti = this._onClick(reti, uid);
        }
        
        return reti;
    };

    return this;
};

// Создает таблицу на основе SQL запроса
DB_GUI.TABLE = function (db_obj, sql) {

    this.db = db_obj || null;

    var xsql = sql || null;
    this.__sql = "";

    if (typeof xsql === 'string') {
        this.__sql = xsql;
    } else {
        if (xsql !== null) {
            this.__sql = xsql.sql;
        }
    }

    this.border = 1;
    this.style = "border: 1px solid #000000; border-collapse: collapse; width:100%;";

    // Установить объект соединения базы данных
    this.setDBObj = function (db_obj) {
        this.db = db_obj;
        return this;
    };

    // Классы для стилей (заголовки)
    this.th_cl = "th_cl";
    // Классы для стилей (поля)
    this.td_cl = "td_cl";
    
    // объект ячеек { "заголовок":new DB_GUI.TD() }
    this.tds = {};
    this.IDKey = null; // Ключевое поле для создания индексов доступа редактирования
    // Внутренняя проверка объектов ячеек таблицы
    this.ALL_FIELDS = true; // добавить все несуществующие поля (автообработка)
    this.__testTDS = function (res) {
        for (var xf = 0; xf < res.filelds_count; xf++) {
            var fname = res.fields_names[xf];
            var td = this.tds[fname];
            if (td === undefined) {
                // стандартная ячейка (добавим её, только если требуется)
                if(this.ALL_FIELDS){
                    td = this.tds[fname] = new DB_GUI.TD();
                    td._FIndex = xf;
                    td._FName = fname;
                }
            }else{
                td._FIndex = xf;
                td._FName = fname;
            }
            
        }
        
        //console.log("TDS = ", this.tds);
    };
    
    // Отрисовка заголовков таблицы
    this.HView = true;
    this._renHeader_ = function (res) {
        var ret = '<tr>';
        
        for (var fname in this.tds) {
            
            var td = this.tds[fname];
            if(td===undefined){ continue; }
            
            ret = ret + '<th class="' + td.thClass + '">';
            
            if (td.title !== null) {
                ret = ret + td.title;
            } else {
                ret = ret + fname;
            }

            ret = ret + '</th>';
        }
        
        ret = ret + '</tr>';

        return ret;
    };
    
    
    // Рисуем ячейку таблицы
    this._renTD = function (res, xr, fname) {
        var ret = "";
        
        var td = this.tds[fname];
        if(td===undefined){return "";}
        
        var uid = -1;
        if(this.IDKey !== null){
            uid = res.getForName(xr, this.IDKey);
        }
        
        ret = ret + '<td class="' + td.cssClass + '" >';
        ret = ret + td._renData(res.getForName(xr, fname), uid);
        ret = ret + '</td>';
       
        return ret;
    };

    // Отрисовка табрицы
    this.render = function () {

        // Получим результат
        var res = this.db.Query(this.__sql);

        //console.log("TABLE.RENDER.RES = ", res);

        var ret = '<table style="' + this.style + '" border="' + this.border + '">';

        // Проверим объекты ячеек таблицы
        this.__testTDS(res);
        
        // Если нужны заголовки - рисуем их
        if (this.HView) {
            ret = ret + this._renHeader_(res);
        }
        
        // рисуем тело таблицы
        for (var xr = 0; xr < res.rows_count; xr++) {
            ret = ret + '<tr>';
            
            for(var fname in this.tds){
                ret = ret + this._renTD(res, xr, fname);
            }
            
            /*for (var xf = 0; xf < res.filelds_count; xf++) {
                ret = ret + this._renTD(res, xr, xf);
            }*/
            ret = ret + '</tr>';
        }

        ret = ret + '</table>';
        return ret;
    };

    return this;
};

module.exports = DB_GUI;


