# NW-database SQLITE

Работает в кодировке UTF-8

<h1>КОМПИЛЯЦИЯ:</h1>

Перед компиляцией проверте соответствие требованиям:
 - Python2.X (python3 – не поддерживается).
 - NodeJS
 - в системе windows – VisualStudio2013 (подойдет express)
 - node-gyp (для проектов nodejs)
 - nw-gyp (для проектов node-webkit) npm install nw-gyp -g


Модуль компилируется при помощи команды: nw-gyp configure build
	(для WINDOWS имеются .bat файлы)

<h1>ИСПОЛЬЗОВАНИЕ:</h1>

<h2>Подключаем модуль: </h2>
var DB = require('../node_modules/sqlite/sqlite.js');
 
<h2>Получить версию модуля (резултат в виде строки):</h2>
alert(DB.Version());

<h2>Соединение (в локальной базе данных - файловая система):</h2>

if(DB.Connect("my_db_file.db")){
	alert("Соединение установлено");
}

<h2>Запрос в базу данных без возврата результата(true/false):</h2>

if(DB.Exec(SQL)){
	alert("Запрос выполнен");
}

<h2>Запрос в базу данных с возвратом результата (результат/false):</h2>

var res = DB.Query(SQL);
if(res!==false){
	alert("Запрос выполнен");
	console.log(res);
}

<h2>Результат в виде объекта со следующими свойствами:</h2>
	- result - массив результирующего запроса
	- rows_count - количество строк результата запроса
	- filelds_count - количество полей результата запроса
	- fields_names - массив с именами полей
	- getForName(row, fName) - возвратит содержимое поля по индексу строки и имени поля
	- get(row, col) - возвратит содержимое поля по индексам строки и поля
	- getFName(col) - возвратит имя поля по его индексу
 
<h1>СБОРКА SQL ЗАПРОСА КОНСТРУКТОРОМ</h1>

Для начала сборки запроса, необходимо создать объект конструктора

var SQL = new DB.SQL();

1. Указываем рабочую таблицу 

	SQL.table("myTable");
	
	или таблицы:
	
	SQL.tables(["myTable1 as t1", "MyTable2 as t2"]);

2. Конструируем часть запроса (select, update, insert) и указываем рабочие поля
	
	SQL.select(["f1","f2", "f3"]);
	
	SQL.update("поле":"данные", "поле2":"данные2", .... });
	
3. Добавляем условия WHERE:
	
	SQL.where("field1=AAA");

4. Выполняем запрос:
	
	var res = SQL.exec();
	
или всё в одной строке:

var res = new DB.SQL().table("myTable").select(["f1","f2", "f3"]).where("field1=AAA").exec();


ДЛЯ БОЛЕЕ ПОДРОБНОГО ОПИСАНИЯ - СМОТРИТЕ ФАЙЛ example.html в данной директории


