# klim-backend
`> npm run dev`
```
localhost:8090/
localhost:8090/login
localhost:8090/dashboard
```

# How to deploy
## Set up `env`
All variables located in `env.example`
### Base
```
PORT=8090                            # work port
IS_PROD=0                            # 1 - prod, 0 - dev
PUBLIC_DOMAIN_LOCAL=localhost        # dev domain
PUBLIC_DOMAIN_PROD=klimstepan.com    # prod domain
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

## Swagger
doc for api

## Deploy on Ubuntu
> sudo apt-get update

### install n
> curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
> bash n lts
> npm install -g n

### install pm2
// install https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
> npm install pm2@latest -g
> pm2 start index.js
> pm2 list
> pm2 stop 0 // id of process
> pm2 start klimsite/klim-backend/index.js

### Setup Nginx config
// nginx config - see Cribs.md
configs placed in ./config folder
> sudo apt install nginx
> sudo nginx -t

#### 1
// link project with nginx
> sudo nano /etc/nginx/sites-available/default
need to change sole lint based on your cloud provider follow # CHANGE_HERE
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name klimstepan.com www.klimstepan.com;

    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 80;
    # server_name 139.59.212.85;
    server_name klimstepan.com www.klimstepan.com;

    access_log /var/log/nginx/klimstepan.com.access.log;
    error_log /var/log/nginx/klimstepan.com.error.log;

    set $frontend_root /home/root/klimsite/klim-frontend/dist;
    set $backend_proxy http://localhost:8090;

    location / {
        root $frontend_root;
        try_files $uri /index.html;
    }
    location /api {
        client_max_body_size 50m;
        proxy_redirect off;
        proxy_pass $backend_proxy;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header Authorization $http_authorization;
    }
    location /public/uploads {
        #root /home/root/klimsite/klim-backend/public/uploads;
        proxy_pass $backend_proxy/public/uploads;
    }
}

# need to create cert before put in config
server {
    listen 443 ssl;
    http2 on;
    server_name klimstepan.com www.klimstepan.com;

    # SSL configuration...
    ssl_certificate /etc/letsencrypt/live/klimstepan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/klimstepan.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    set $frontend_root /home/root/klimsite/klim-frontend/dist;
    set $backend_proxy http://localhost:8090;

    # route handlers
    location / {
        root $frontend_root;
        try_files $uri /index.html;
    }
    location /api {
        client_max_body_size 50m;
        proxy_redirect off;
        proxy_pass $backend_proxy;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Authorization $http_authorization;
    }
    location /public/uploads {
        proxy_pass $backend_proxy/public/uploads;
    }
}
```
check status
> sudo nginx -t
> service nginx status
<!-- > systemctl status nginx -->
> sudo service nginx restart

#### 2
```
server {
    listen 80;
    # server_name 139.59.212.85;
    server_name klimstepan.com www.klimstepan.com;

    access_log /var/log/nginx/klimstepan.com.access.log;
    error_log /var/log/nginx/klimstepan.com.error.log;

    set $frontend_root /home/root/klimsite/klim-frontend/dist;
    set $backend_proxy http://localhost:8090;

    location / {
        root $frontend_root;
        try_files $uri /index.html;
    }
    location /api {
        client_max_body_size 50m;
        proxy_redirect off;
        proxy_pass $backend_proxy;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header Authorization $http_authorization;
    }
    location /public/uploads {
        #root /home/root/klimsite/klim-backend/public/uploads;
        proxy_pass $backend_proxy/public/uploads;
    }
}
```
#### 3
> sudo nano /etc/nginx/sites-available/default
```
server {
    listen 80;
    # server_name 139.59.212.85;
    server_name klimstepan.com www.klimstepan.com;

    access_log /var/log/nginx/klimstepan.com.access.log;
    error_log /var/log/nginx/klimstepan.com.error.log;

    set $frontend_root /home/root/klimsite/klim-frontend/dist;
    set $backend_proxy http://localhost:8090;

    location / {
        root $frontend_root;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        client_max_body_size 50m;
        proxy_redirect off;
        proxy_pass $backend_proxy;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header Authorization $http_authorization;
    }
    location /public/uploads {
        #root /home/root/klimsite/klim-backend/public/uploads;
        proxy_pass $backend_proxy/public/uploads;
    }
}
```

#### 4 klimstepan.com
Configurate domain
1. define right path for static front end files `/home/root/klimsite/klim-frontend/dist;`
   1. `root /home/root/klimsite/klim-frontend/dist;`
2. put klimstepan.com file at `/etc/nginx/sites-available`
3. put klimstepan.com file at `/etc/nginx/sites-enabled`
4. `/etc/nginx/sites-available/default` - don't change (please check in `./default`)
5. > sudo nano /etc/nginx/sites-available/klimstepan.com


```nginx
server {
    listen 80;
    # SSL configuration
    #
    # listen 443 ssl default_server;
    # listen [::]:443 ssl default_server;
    #
    # Note: You should disable gzip for SSL traffic.
    # See: https://bugs.debian.org/773332
    #
    # Read up on ssl_ciphers to ensure a secure configuration.
    # See: https://bugs.debian.org/765782
    #
    # Self signed certs generated by the ssl-cert package
    # Don't use them in a production server!
    #

    server_name klimstepan.com www.klimstepan.com;

    location /api {
        proxy_pass http://localhost:8090;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Authorization $http_authorization;
        client_max_body_size 50m;
    }

    #fronend
    location / {
        try_files $uri $uri/ /index.html;
        root /root/klimsite/klim-frontend/dist;
    }
    location /public/uploads {
        proxy_pass http://localhost:8090/public/uploads;
    }

    # added automaticly from CertBot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/klimstepan.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/klimstepan.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}

# added automaticly
server {
    if ($host = www.klimstepan.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = klimstepan.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name klimstepan.com www.klimstepan.com;
    return 404; # managed by Certbot
}

```


#### nginx commands
restart
sudo nginx -t && sudo systemctl restart nginx
> sudo nginx -t
> sudo systemctl restart nginx

logs
> tail -f /var/log/nginx/klimstepan.com.error.log
> tail -f /var/log/nginx/klimstepan.com.access.log
> sudo journalctl -u nginx --no-pager --lines=50

status
> service nginx status
> pwd
/root/klimsite/klim-frontend/dist
> sudo nginx -T | grep server_name -A 3
> curl -I http://klimstepan.com/api/v1/contact -H "Domain: klimstepan.com"

provide access to static front end file if www-data don't have access (see logs `2025/04/05 11:52:52 [crit] 239561#239561: *3 stat() "/root/klimsite/klim-frontend/dist/favicon.ico" failed (13: Permission denied),`)
> sudo -u www-data stat /root/klimsite/klim-frontend/dist
> gpasswd -a www-data root
> chmod g+x /root && chmod g+x /root/klimsite/klim-frontend/dist && chmod g+x /root/klimsite/klim-frontend/dist
> nginx -s reload
> curl -I https://klimstepan.com/api/v1/contact


### Firewall Setup
https://itnext.io/deploy-a-nodejs-and-expressjs-app-on-digital-ocean-with-nginx-and-free-ssl-edd88a5580fa
> sudo ufw enable
> sudo ufw allow http
> sudo ufw allow https
> sudo ufw allow ssh

### install postgres
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


### build
when PC/Droplet/EC2/ComputerEngine has small memory
> free -m
> sudo fallocate -l 2G /swapfile
> sudo chmod 600 /swapfile
> sudo mkswap /swapfile
> sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> free -m
> NODE_OPTIONS="--max-old-space-size=512" npm run build
 Закрий зайві процеси
> ps aux --sort=-%mem | head -10

### Let's Encrypt - create SSL cert (https)
> sudo apt update
> sudo apt install certbot python3-certbot-nginx -y
> sudo certbot --nginx -d klimstepan.com -d www.klimstepan.com
> curl https://klimstepan.com


### notions
> nano klimsite/klim-backend/.env
> pm2 start klimsite/klim-backend/index.js
> sudo tail -f /var/log/nginx/klimstepan.com.error.log
> sudo tail -f /var/log/nginx/klimstepan.com.access.log
// check DNS IPs
> nslookup klimstepan.com
// check DNS records
> https://www.whatsmydns.net/dns-lookup/ns-records?query=klimstepan.com

https://www.youtube.com/watch?v=PFL4_W0jmzM

## TODO:
1. + Add user_id column for each table
2. swagger doc
3. ESlint
4. Prettier
5. unit testin with Jest

