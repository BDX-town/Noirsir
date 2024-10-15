FROM node:20.14.0-alpine

# noircir folder: where you saved noircir files
ENV NOIRCIR_FOLDER="/noircir"
# nginx root: all noircir data will be saved there, blogs and generated content
ENV NGINX_FOLDER=/usr/share/nginx/html
# 11ty base path: all blogs data will be saved there. Will be under NGINX_FOLDER
ENV BLOGS_FOLDER=blogs
# blog's ressources: each blog has it's own ressources folder, where all media will be uploaded. Will be under NGINX_FOLDER/BLOGS_FOLDER/username
ENV RESSOURCES_FOLDER=ressources
# must match nginx user 
ENV WWW_USER=noircir
# must match nginx group
ENV WWW_GROUP=www-data

RUN apk add curl gnupg

# install deps
RUN apk add gettext gum nginx nginx-mod-http-lua nginx-mod-http-dav-ext openssl bash \
    && corepack enable


RUN mkdir -p $NGINX_FOLDER


# install noircir 
COPY . $NOIRCIR_FOLDER 
RUN mkdir -p /tools && mv $NOIRCIR_FOLDER/tools /tools
RUN cd $NOIRCIR_FOLDER && npx yarn && npx yarn run build && cd /
RUN cp -r $NOIRCIR_FOLDER/cms/dist/* $NGINX_FOLDER


RUN adduser -D -u 1001 -h /home/$WWW_USER -G $WWW_GROUP $WWW_USER\
    && mkdir -p $NGINX_FOLDER/$BLOGS_FOLDER \
    && chown -R $WWW_USER:$WWW_GROUP $NGINX_FOLDER \
    && envsubst '$NGINX_FOLDER,$BLOGS_FOLDER' < $NOIRCIR_FOLDER/nginx.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/http.d/noircir

EXPOSE 8080

STOPSIGNAL SIGQUIT

CMD /tools/startup.sh