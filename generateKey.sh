openssl genrsa -out ./key/private.pem 512
openssl rsa -in ./key/private.pem -out ./key/public.pem -outform PEM -pubout

openssl genrsa -out ./key/private-cashier.pem 512
openssl rsa -in ./key/private-cashier.pem -out ./key/public-cashier.pem -outform PEM -pubout