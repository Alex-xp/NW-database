#include <node.h>
#include <v8.h>
#include <string>

#include "libpq/libpq-fe.h"

using namespace v8; // пространство имен двигателя javascript v8

// Общий метод получения экземпляра двигателя v8 (с выделением текущего потока)
Isolate* GetV8(){
	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = Isolate::GetCurrent();

	// стек управляющий экземплярами потоков v8 двигателя - выделяем текущий поток
	HandleScope scope(isolate);

	return isolate;
}

PGconn *conn; // Соединение в модуле
PGresult *result; // результат последнего запроса
int rows = 0;
int cols = 0;

/**
Соединение с базой
СТРОКА СОЕДИНЕНИЯ: "dbname=test_base host=localhost port=5432 user=postgres password=000000"
Вернет true - при удачном соединении, или false - при сбое соединения
*/
void c_Connect(const v8::FunctionCallbackInfo<Value>& args){

	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = GetV8();

	// первый параметр - строка соединения
	v8::String::Utf8Value param1(args[0]->ToString()); // принимаем параметр и преобрасовываем в массив символов
	std::string conn_str = std::string(*param1); // готовим строку соединения

	conn = PQconnectdb(conn_str.c_str());

	bool res;

	if (PQstatus(conn) == CONNECTION_BAD) {
            res = false;
        }else{
            res = true;
            //if(PQsetClientEncoding(conn, "WIN1251"))res = true;
        }
        
        

	args.GetReturnValue().Set(Boolean::New(isolate, res));

};

/**
 * отсоединение от базы данных
 */
void c_Close(const v8::FunctionCallbackInfo<Value>& args){
	PQclear(result);
	PQfinish(conn);
}


/**
 * Обращение к базе данных
 * @param exports
 */
void c_Query(const v8::FunctionCallbackInfo<Value>& args){
    rows = 0;
    cols = 0;
    
    PQclear(result);
    
    v8::String::Utf8Value param1(args[0]->ToString());
    std::string query = std::string(*param1);
    
    result = PQexec(conn, query.c_str());
    
    rows = PQntuples(result);
    cols = PQnfields(result);
}

/**
 * получить сообщение об ошибке
 * @param args
 */
void c_ErrorMsg(const v8::FunctionCallbackInfo<Value>& args){
    Isolate* isolate = GetV8();
    
    std::string err = PQerrorMessage(conn);
    
    args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, err.c_str()));
}

/**
 * Проверка на ошибку в работе (false - нет ошибки или сообщение об ошибке)
 * @param args
 */
void c_isError(const v8::FunctionCallbackInfo<Value>& args){
    Isolate* isolate = GetV8();
    std::string err = PQerrorMessage(conn);
    
    if(err.empty()){
        args.GetReturnValue().Set(v8::Boolean::New(isolate, false));
    }else{
        args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, err.c_str()));
    }
}


/**
 * проверка наличия данных после запроса
 */
void c_isData(const v8::FunctionCallbackInfo<Value>& args){
	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = GetV8();

	bool res = false;

	if (PQresultStatus(result) == PGRES_TUPLES_OK){
		res = true;
	}

	args.GetReturnValue().Set(Boolean::New(isolate, res));
}

/*
Получить количество строк в результате запроса
*/
void c_rows_count(const v8::FunctionCallbackInfo<Value>& args){
	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = GetV8();
	
	args.GetReturnValue().Set(Integer::New(isolate, rows));
}

/*
Получить количество полей в результате запроса (колонки)
*/
void c_fields_count(const v8::FunctionCallbackInfo<Value>& args){
	// получить изолированный экземпляр двигателя v8 (поток)
	Isolate* isolate = GetV8();

	args.GetReturnValue().Set(Integer::New(isolate, cols));
}


//******************************************************************************
// РЕЗУЛЬТАТЫ ЗАПРОСОВ
//******************************************************************************

// ПОЛУЧИТЬ СТАТУС ВЫПОЛНЕННОГО ЗАПРОСА
void c_resultStatus(const v8::FunctionCallbackInfo<Value>& args){
    Isolate* isolate = GetV8();
    
    ExecStatusType st =PQresultStatus(result);
    
    std::string ret = "";
    
    if(st==PGRES_EMPTY_QUERY){ret="PGRES_EMPTY_QUERY";}
    if(st==PGRES_COMMAND_OK){ret="PGRES_COMMAND_OK";}
    if(st==PGRES_TUPLES_OK){ret="PGRES_TUPLES_OK";}
    if(st==PGRES_COPY_OUT){ret="PGRES_COPY_OUT";}
    if(st==PGRES_COPY_IN){ret="PGRES_COPY_IN";}
    if(st==PGRES_BAD_RESPONSE){ret="PGRES_BAD_RESPONSE";}
    if(st==PGRES_NONFATAL_ERROR){ret="PGRES_NONFATAL_ERROR";}
    if(st==PGRES_FATAL_ERROR){ret="PGRES_FATAL_ERROR";}
    if(st==PGRES_COPY_BOTH){ret="PGRES_COPY_BOTH";}
    if(st==PGRES_SINGLE_TUPLE){ret="PGRES_SINGLE_TUPLE";}
    
    args.GetReturnValue().Set(String::NewFromUtf8(isolate,ret.c_str()));
}

/* получить заголовок поля по его номеру */
void c_getFName(const v8::FunctionCallbackInfo<Value>& args){
    Isolate* isolate = GetV8();
    auto xfield = args[0];
    int64_t col = 0;
    if(xfield->IsInt32()){
        col = xfield->IntegerValue();
    }
    
    args.GetReturnValue().Set(String::NewFromUtf8(isolate,  PQfname(result, col)));
}

// Получить данные по индексу (не нужно преоблазовывать!!!)
void c_get(const v8::FunctionCallbackInfo<Value>& args){
    Isolate* isolate = GetV8();
    
    auto xrow = args[0];
    auto xfield = args[1];
    int64_t row = 0;
    int64_t col = 0;
    if(xrow->IsInt32()){
        row = xrow->IntegerValue();
    }
    if(xfield->IsInt32()){
        col = xfield->IntegerValue();
    }
    
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, PQgetvalue(result, row, col)));
}

/** Получить данные таблицы после запроса (массив-массивов) */
void c_getMainArrData(const v8::FunctionCallbackInfo<Value>& args){
    Isolate* isolate = GetV8();
    
    // Основной массив - строки
    Handle<Array> resArr = Array::New(isolate, rows);
    
    for (int Xrow = 0; Xrow<rows; Xrow++) {
        
        Handle<Array> resRow = Array::New(isolate, cols);
        
        for (int Xcol = 0; Xcol<cols; Xcol++) {
            
            resRow->Set(Xcol, String::NewFromUtf8(isolate, PQgetvalue(result, Xrow, Xcol)));
            resArr->Set(Xrow, resRow);
        }
    }
    
    args.GetReturnValue().Set(resArr);
}


void Init(Local<Object> exports) {
    
    // Соединение с базой данных
	NODE_SET_METHOD(exports, "c_Connect", c_Connect);
	NODE_SET_METHOD(exports, "c_Close", c_Close);
    NODE_SET_METHOD(exports, "c_Query", c_Query);
	NODE_SET_METHOD(exports, "c_ErrorMsg", c_ErrorMsg);
	NODE_SET_METHOD(exports, "c_isError", c_isError);
	NODE_SET_METHOD(exports, "c_isData", c_isData);
    NODE_SET_METHOD(exports, "c_rows_count", c_rows_count);
	NODE_SET_METHOD(exports, "c_fields_count", c_fields_count);
    
    // ДАННЫЕ ЗАПРОСА
	NODE_SET_METHOD(exports, "c_resultStatus", c_resultStatus);
	NODE_SET_METHOD(exports, "c_getFName", c_getFName);
	NODE_SET_METHOD(exports, "c_get", c_get);
	NODE_SET_METHOD(exports, "c_getMainArrData", c_getMainArrData);
    
}

NODE_MODULE(wrapTest, Init);