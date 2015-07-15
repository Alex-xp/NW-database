#include <node.h>
#include <v8.h>
#include <string>

#include <stdio.h>
#include "include\sqlite3.h" // Для работы с SQLITE

using namespace v8; // пространство имен двигателя javascript v8

// стандартная библиотека
using namespace std;

// Общий метод получения экземпляра двигателя v8 (с выделением текущего потока)
Isolate* GetV8(){

	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = Isolate::GetCurrent();

	// стек управляющий экземплярами потоков v8 двигателя - выделяем текущий поток
	HandleScope scope(isolate);

	return isolate;

}

sqlite3 *db = 0; // хэндл объекта соединение к БД
char *err = 0;

// Соединение (открытие) с базой данных
void c_Connect(const v8::FunctionCallbackInfo<Value>& args){
	Isolate* isolate = Isolate::GetCurrent();

	// получим строку соединения
	v8::String::Utf8Value param1(args[0]->ToString());
	std::string filename = std::string(*param1);

	boolean reti = false;

	if (sqlite3_open(filename.c_str(), &db)){
		reti = false;
		//sqlite3_free(err);
	}
	else{
		reti = true;
	}

	args.GetReturnValue().Set(v8::Boolean::New(isolate, reti));

}

v8::Handle<Array> resData = v8::Array::New(GetV8());
int rowsCount = 0;
int fieldsCount = 0;

// Обратный вызов для получения данных из базы
static int callback(void *data, int argc, char **argv, char **azColName){
	// ФУНКЦИЯ ВЫЗЫВАЕСТЯ ПРИ ОБХОДЕ КАЖДОЙ СТРОКИ ЗАПРОСА
	// argc - количество полей с втроке
	// argv - Строка с данными поля
	// azColName - строка с именем поля

	Isolate* isolate = Isolate::GetCurrent();

	v8::Handle<v8::Object> obj = v8::Object::New(isolate);
	for (int i = 0; i < argc; i++){
		std::string key = azColName[i];
		std::string val = argv[i] ? argv[i] : "NULL";

		obj->ForceSet(v8::String::NewFromUtf8(isolate, key.c_str()),v8::String::NewFromUtf8(isolate, val.c_str()));

		fieldsCount = i;
	}

	resData->Set(rowsCount, obj);
	rowsCount++;

	return 0;
}

// Запрос в базу данных с возвратом значения (SELECT)
void c_Query(const v8::FunctionCallbackInfo<Value>& args){
	Isolate* isolate = GetV8();

	// получим строку запроса
	v8::String::Utf8Value param1(args[0]->ToString());
	std::string SQL = std::string(*param1);

	rowsCount = 0;
	resData = v8::Array::New(isolate, 0); // Создадим массив для результата

	const char* data = "Callback function called";
	if (sqlite3_exec(db, SQL.c_str(), callback, (void*)data, &err)){
		args.GetReturnValue().Set(v8::Boolean::New(isolate, false));
	}
	else{
		args.GetReturnValue().Set(v8::Boolean::New(isolate, true));
		args.GetReturnValue().Set(resData);
	}
}


// запрос в базу без возврата значения (CREATE, INSERT, UPDATE)
void c_Exec(const v8::FunctionCallbackInfo<Value>& args){
	Isolate* isolate = GetV8();

	// получим строку запроса
	v8::String::Utf8Value param1(args[0]->ToString());
	std::string SQL = std::string(*param1);

	if (sqlite3_exec(db, SQL.c_str(), 0, 0, &err)){
		args.GetReturnValue().Set(v8::Boolean::New(isolate, false));
	}
	else{
		args.GetReturnValue().Set(v8::Boolean::New(isolate, true));
	}
}

// Получить ошибку
void c_GetErr(const v8::FunctionCallbackInfo<Value>& args){
	Isolate* isolate = Isolate::GetCurrent();

	args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, err));

	sqlite3_free(err);
}


// Метод, возвращающий версию данного модуля
void c_Version(const v8::FunctionCallbackInfo<Value>& args){
	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = Isolate::GetCurrent();

	args.GetReturnValue().Set(String::NewFromUtf8(isolate, "1.0.0"));
}


void Init(Handle<Object> exports) {

	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = Isolate::GetCurrent();

	NODE_SET_METHOD(exports, "c_Version", c_Version);
	NODE_SET_METHOD(exports, "c_Connect", c_Connect);
	NODE_SET_METHOD(exports, "c_Query", c_Query);
	NODE_SET_METHOD(exports, "c_Exec", c_Exec);
	NODE_SET_METHOD(exports, "c_GetErr", c_GetErr);
}


// регистрируем модуль (имя_модуля, функция_инициализации_экспорта)
NODE_MODULE(Mod_template01, Init)

