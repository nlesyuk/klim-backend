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
> pm2 start index.js 
> pm2 list
> pm2 stop 0 // id of process
> pm2 start klimsite/klim-backend/index.js

// nginx config - see Cribs.md
configs placed in ./config folder
> sudo apt install nginx
> sudo nginx -t

// link project with nginx
> sudo nano /etc/nginx/sites-available/default

need to change sole lint based on your cloud provider follow # CHANGE_HERE
```nginx
server {
    listen 80;
    server_name klimstepan.com www.klimstepan.com; # CHANGE_HERE

    location /api {
        client_max_body_size 50m;
        proxy_redirect off;
        proxy_pass http://localhost:8090; # CHANGE_HERE Backend
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
    }
    #fronend
    location / {
        root /home/ubuntu/klim-frontend/dist; # CHANGE_HERE
        try_files $uri /index.html;
    }
    location /public/uploads {
        #root /home/ubuntu/www/klim-backend/public/uploads;
        proxy_pass http://localhost:8090/public/uploads;
    }
}
```
check status
>sudo nginx -t 
>sudo service nginx restart

// Firewall Setup https://itnext.io/deploy-a-nodejs-and-expressjs-app-on-digital-ocean-with-nginx-and-free-ssl-edd88a5580fa
> sudo ufw enable
> sudo ufw allow http
> sudo ufw allow https
> sudo ufw allow ssh

// install postgres
> sudo apt install postgresql -y
> sudo su - postgres
> psql
postgres=# CREATE ROLE ubuntu; <!-- ubuntu - username that you are under in OS -->
postgres=# ALTER ROLE ubuntu WITH LOGIN;
postgres=# ALTER USER ubuntu CREATEDB SUPERUSER;
postgres=# ALTER USER ubuntu WITH PASSWORD 'password';
postgres=# \du
postgres=# CREATE DATABASE klim;
postgres=# \l
postgres=# \c klim
klim=# HERE_YOU_SHOULD_INSERT_TABEL_SCHEME `create TABLE users(...)`
klim=# \d
klim=# exit
<!-- postgres=# ALTER USER "user" with superuser; -->
postgres=# ALTER USER ubuntu with superuser;
<!-- psql=# grant all privileges on database <dbname> to <username> ; -->
psql=# grant all privileges on database klim to ubuntu;
<!-- psql=# alter user <username> with encrypted password '<password>'; -->
psql=# alter user ubuntu with encrypted password '1234567890'; <!-- Change password -->
<!-- psql=# grant all privileges on database <dbname> to <username> ; -->
psql=# grant all privileges on database klim to ubuntu;

// create folders
/public/uploads/klimstepan.com...

// set up .env

// pull git repo


