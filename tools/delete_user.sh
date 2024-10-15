#!/bin/sh
set -euo pipefail

: "${NGINX_FOLDER:=/usr/share/nginx/html}"
# path must be the same that root in nginx.conf + a blogs folder
: "${BLOGS_FOLDER:=blogs}"

# source 
# https://starbeamrainbowlabs.com/blog/article.php?article=posts%2F237-WebDav-Nginx-Setup.html

gum style --foreground 212 "delete_user.sh: delete access and blog from Noircir"

USERNAME=$(gum input --placeholder "Username")

if test -z "$USERNAME" 
then
    echo "You must provide a non-empty username"
    exit 1
fi

if [ ! -d "$NGINX_FOLDER/$BLOGS_FOLDER/$USERNAME" ]
then
    echo "User '$USERNAME' does not exist"
    exit 1
fi

gum confirm "Are you sure you want to remove $USERNAME blog and access to Noircir ?" || exit 0

rm -r "$NGINX_FOLDER/$BLOGS_FOLDER/$USERNAME"