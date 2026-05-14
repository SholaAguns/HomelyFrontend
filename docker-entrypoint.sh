#!/bin/sh
# Inject runtime env vars into env.js before nginx starts.
# Set API_URL and WS_URL as Railway environment variables.
envsubst '${API_URL} ${WS_URL}' \
  < /usr/share/nginx/html/assets/env.template.js \
  > /usr/share/nginx/html/assets/env.js

exec nginx -g 'daemon off;'
