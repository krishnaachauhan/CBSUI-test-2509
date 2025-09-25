#!/bin/sh

# Step 1: Generate frontend configuration file
cat <<EOF > /var/www/netbanking/config/configuration.json
{
  "API_URL": "${REACT_APP_API_URL}",
  "WEBSOCKET_URL": "${REACT_WEBSOCKET_URL}",
  "theme": "${REACT_APP_THEME}",
  "WEBSOCKET_ENABLED": "${REACT_WEBSOCKET_ENABLED}"
}
EOF

# Step 2: Choose correct nginx.conf based on SSL_ENABLE
if [ "$SSL_ENABLE" = "true" ]; then
    echo "SSL is enabled. Using nginx_linux.conf."
    cp /opt/nginx_linux.conf /etc/nginx/nginx.conf
else
    echo "SSL is not enabled. Using nginx_linux_no_ssl.conf."
    cp /opt/nginx_linux_no_ssl.conf /etc/nginx/nginx.conf
fi

# Step 3: Replace placeholder with actual REACT_APP_API_URL
sed -i "s|__REACT_APP_API_URL__|${REACT_APP_API_URL}|g" /etc/nginx/nginx.conf
sed -i "s|__REACT_WEBSOCKET_URL__|${REACT_WEBSOCKET_URL}|g" /etc/nginx/nginx.conf
sed -i "s|__REACT_CSP_ALLOWED_URL__|${REACT_CSP_ALLOWED_URL}|g" /etc/nginx/nginx.conf

# Step 4: Log output
echo "Generated configuration.json:"
cat /var/www/netbanking/config/configuration.json

echo "Final nginx.conf:"
cat /etc/nginx/nginx.conf

# Step 5: Start nginx in foreground
nginx -g 'daemon off;'
