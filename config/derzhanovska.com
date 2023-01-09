
server {
        listen 80;
#        listen [::]:80 default_server;
   server_name derzhanovska.com www.derzhanovska.com;

    location /api {
        client_max_body_size 50m;
        proxy_redirect off;
        proxy_pass http://localhost:8090;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
    }
    #fronend
    location / {
        root /home/ubuntu/anna-frontend/dist;
        try_files $uri /index.html;
    }
    location /public/uploads {
        #root /home/ubuntu/www/klim-backend/public/uploads;
        proxy_pass http://localhost:8090/public/uploads;
    }
}