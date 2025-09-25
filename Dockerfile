FROM nginx:alpine

RUN mkdir -p /opt/ssl

# COPY nginx_linux.conf /etc/nginx/nginx.conf 
COPY nginx_linux.conf /opt/
COPY nginx_linux_no_ssl.conf /opt/
COPY ./build/ /var/www/netbanking
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN dos2unix /entrypoint.sh
#COPY ./.keys/* /var/www/netbanking
#EXPOSE 3000
# Use ENTRYPOINT to ensure the script runs every time the container starts
ENTRYPOINT ["/entrypoint.sh"]