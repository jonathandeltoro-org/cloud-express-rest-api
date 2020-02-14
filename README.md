# cloud-express-rest-ap
Heroku url: https://cloud-express-rest-api.herokuapp.com/api/usuarios


current config:
```
Token     Default   MongoDb     Tables
WDp5V4    True      zone1       'usuarios', 'tareas'
l1cs4h    False     zone2       'usuarios', 'aplicaciones'
r37JDp    False     zone3       'usuarios', 'comidas'
NKFyzL    False     zone4       'usuarios', 'paises'
```

WDp5V4 is the default token if no token is provided.

Request:
```
GET /api/usuarios HTTP/1.1
Host: cloud-express-rest-api.herokuapp.com
token: r37JDp
Content-Type: application/json
Cache-Control: no-cache
```

Respose:
```[
    {
        "_id": "5e45f4ffc36bb9001684bafc",
        "name": "user r37JDp"
    },
    {
        "_id": "5e45f572c36bb9001684baff",
        "name": "other r37JDp"
    }
]
```
