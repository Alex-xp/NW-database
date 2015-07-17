{
    "targets": [
        {
            "target_name": "pgsql_lib",
            "sources": [
                "pgsql_lib.cc",
				"libs/libpq-fe.h"
            ],
            "libraries": ["../libs/libpq"],
            "include_dirs": ["../libpq/"]
        }
    ]
}
