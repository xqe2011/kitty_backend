FROM mariadb:latest
COPY database.sql /docker-entrypoint-initdb.d/1-database.sql
COPY create-da-user.sh /docker-entrypoint-initdb.d/2-create-da-user.sh
COPY certs/server /etc/mysql/certificates
COPY config.cnf /etc/mysql/conf.d
COPY secure.sh /docker-entrypoint-initdb.d/3-secure.sh