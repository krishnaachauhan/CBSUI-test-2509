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

# Step 4: Add stub_status configuration if metrics are enabled
if [ "${NGINX_ENABLE_METRICS:-false}" = "true" ]; then
    echo "Enabling NGINX metrics (stub_status)..."
    
    # Create a separate server block for metrics on port 8080
    cat <<'EOF' >> /etc/nginx/nginx.conf

    # Metrics server for Prometheus
    server {
        listen 8080;
        server_name localhost;
        
        location /stub_status {
            stub_status;
            allow 127.0.0.1;
            allow ::1;
            deny all;
            access_log off;
        }
        
        location /healthz {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
EOF
    echo "NGINX metrics configuration added."
fi

# Step 5: Log output
echo "Generated configuration.json:"
cat /var/www/netbanking/config/configuration.json

echo "Final nginx.conf:"
cat /etc/nginx/nginx.conf

# Step 6: Start nginx in foreground
nginx -g 'daemon off;'
