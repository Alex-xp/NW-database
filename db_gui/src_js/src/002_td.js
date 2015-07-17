// *****************************************************************************
// КЛАСС ОПИСАНИЯ ЯЧЕЙКИ ТАБЛИЦЫ
// *****************************************************************************

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




