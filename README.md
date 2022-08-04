# klim-backend

`> npm run dev`

```
localhost:8090/
localhost:8090/login
localhost:8090/dashboard
```

## Set up `env`
All variables located in `env.example`
### Base
```
PORT=8090                            # work port
IS_PROD=0                            # 1 - prod, 0 - dev
PUBLIC_DOMAIN_LOCAL=localhost        # dev domain
PUBLIC_DOMAIN_PROD=klimstepan.ca     # prod domain
```
### DB
local
```
DB_LOCAL_USER=postgres
DB_LOCAL_PASSWORD=1234567890
DB_LOCAL_HOST=localhost
DB_LOCAL_PORT=5432
DB_LOCAL_DBNAME=klim
```
prod
```
DB_PROD_USER=
DB_PROD_PASSWORD=
DB_PROD_HOST=localhost
DB_PROD_PORT=5432
DB_PROD_DBNAME=
```

 ## TODO:
 1. Add user_id column for each table