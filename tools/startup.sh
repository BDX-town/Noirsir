#!/bin/sh
: "${NOIRCIR_FOLDER:=/noircir}"
: "${NGINX_FOLDER:=/var/www/html}"
: "${BLOGS_FOLDER:=blogs}"
: "${WWW_USER:=noircir}"
: "${WWW_GROUP:=www-data}"

nginx
su $WWW_USER
echo '{"layout": "article.11ty.js" }' > $NGINX_FOLDER/$BLOGS_FOLDER/blogs.json
cd $NOIRCIR_FOLDER
yarn start