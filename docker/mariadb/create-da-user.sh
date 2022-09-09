#!/bin/sh

USERNAME=$KITTY_DA_USERNAME
PASSWORD=$KITTY_DA_PASSWORD
DATABASE=$MARIADB_DATABASE
mysql -uroot -p"${MARIADB_ROOT_PASSWORD}" << EOF
CREATE USER \`${USERNAME}\`@\`%\` IDENTIFIED WITH mysql_native_password USING password('${PASSWORD}') PASSWORD EXPIRE NEVER;
ALTER USER '${USERNAME}'@'%' REQUIRE SUBJECT '/CN=Kitty Data Analysis';
GRANT Select ON TABLE \`${DATABASE}\`.\`achievement\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`article\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`cat\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`cat_photo\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`cat_recommendation\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`cat_user_photo\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`user_achievement\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`user_log\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`cat_vector\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`comment\` TO \`${USERNAME}\`@\`%\`;
GRANT Select ON TABLE \`${DATABASE}\`.\`comments_area\` TO \`${USERNAME}\`@\`%\`;
GRANT Select(\`id\`) ON TABLE \`${DATABASE}\`.\`user\` TO \`${USERNAME}\`@\`%\`;
GRANT Select(\`role\`) ON TABLE \`${DATABASE}\`.\`user\` TO \`${USERNAME}\`@\`%\`;
GRANT Select(\`lastLoginDate\`) ON TABLE \`${DATABASE}\`.\`user\` TO \`${USERNAME}\`@\`%\`;
GRANT Select(\`createdDate\`) ON TABLE \`${DATABASE}\`.\`user\` TO \`${USERNAME}\`@\`%\`;
GRANT Select(\`points\`) ON TABLE \`${DATABASE}\`.\`user\` TO \`${USERNAME}\`@\`%\`;
EOF