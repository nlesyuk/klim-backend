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
 1. + Add user_id column for each table
 2. swagger doc
 3. ESlint
 4. Prettier
 5. unit testin with Jest


## Swagger
doc for api


### how to deploy in EC2 instance
> sudo apt-get update

// install n
> curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
> bash n lts
> npm install -g n

// install https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
> npm install pm2@latest -g

// nginx config - see Cribs.md
> sudo apt install nginx

// Firewall Setup https://itnext.io/deploy-a-nodejs-and-expressjs-app-on-digital-ocean-with-nginx-and-free-ssl-edd88a5580fa
> sudo ufw enable
> sudo ufw allow http
> sudo ufw allow https
> sudo ufw allow ssh

// install postgres
> sudo apt install postgresql -y
> sudo su - postgres
> psql
postgres=# CREATE ROLE ubuntu;
postgres=# ALTER ROLE ubuntu WITH LOGIN;
postgres=# ALTER USER ubuntu CREATEDB SUPERUSER;
postgres=# ALTER USER ubuntu WITH PASSWORD 'password';
postgres=# \du
postgres=# CREATE DATABASE klim;
postgres=# \l
postgres=# \c klim
postgres=# HERE_YOU_SHOULD_INSERT_TABEL_SCHEME `create TABLE users(...)`
postgres=# \d
postgres=# ALTER USER "user" with superuser;
psql=# grant all privileges on database <dbname> to <username> ;
psql=# alter user <username> with encrypted password '<password>';
psql=# grant all privileges on database <dbname> to <username> ;

// create folders
/public/uploads/klimstepan.com...

// set up .env

// pull git repo


