#!/bin/sh

BACKEND_IP=`getent hosts backend | awk '{ print $1 }'`
mysql -uroot -p"${MARIADB_ROOT_PASSWORD}" << EOF
ALTER USER 'root'@'%' REQUIRE SUBJECT '/CN=Root';
RENAME USER '${MARIADB_USER}'@'%' TO '${MARIADB_USER}'@'${BACKEND_IP}';
EOF