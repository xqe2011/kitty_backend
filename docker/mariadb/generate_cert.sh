#!/bin/sh

# 生成目录
rm -r certs > /dev/null
mkdir certs certs/server certs/ca certs/da-client certs/root-client
cd certs

# 生成CA机构证书和Key
openssl genrsa 4096 > ./ca/ca-key.pem
openssl req -new -x509 -nodes -days 365000 -key ./ca/ca-key.pem -out ./ca/ca-cert.pem -subj "/ON=Kitty/OUN=CA"
cp ./ca/ca-cert.pem da-client
cp ./ca/ca-cert.pem root-client
cp ./ca/ca-cert.pem server

# 生成服务器证书和Key
openssl req -newkey rsa:4096 -days 365000 -nodes -keyout ./server/server-key.pem -out ./server/server-req.pem -subj "/ON=Kitty/OUN=Server/CN=$1"
openssl rsa -in ./server/server-key.pem -out ./server/server-key.pem

# 生成客户端证书和Key
openssl req -newkey rsa:4096 -days 365000 -nodes -keyout ./da-client/client-key.pem -out ./da-client/client-req.pem -subj "/ON=Kitty/OUN=Client/CN=Kitty Data Analysis"
openssl rsa -in ./da-client/client-key.pem -out ./da-client/client-key.pem
openssl req -newkey rsa:4096 -days 365000 -nodes -keyout ./root-client/client-key.pem -out ./root-client/client-req.pem -subj "/ON=Kitty/OUN=Client/CN=Root"
openssl rsa -in ./root-client/client-key.pem -out ./root-client/client-key.pem

# 签名服务器证书和客户端证书
openssl x509 -req -sha256 -extensions v3_ca -in ./server/server-req.pem -days 365000 -CA ./ca/ca-cert.pem -CAkey ./ca/ca-key.pem -set_serial 01 -out ./server/server-cert.pem
openssl x509 -req -sha256 -extensions v3_ca -in ./da-client/client-req.pem -days 365000 -CA ./ca/ca-cert.pem -CAkey ./ca/ca-key.pem -set_serial 02 -out ./da-client/client-cert.pem
openssl x509 -req -sha256 -extensions v3_ca -in ./root-client/client-req.pem -days 365000 -CA ./ca/ca-cert.pem -CAkey ./ca/ca-key.pem -set_serial 03 -out ./root-client/client-cert.pem

# 删除垃圾
rm ./server/server-req.pem ./da-client/client-req.pem ./root-client/client-req.pem

echo "Certificate generated successfully!"