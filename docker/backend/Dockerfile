FROM node:17
COPY app /app
WORKDIR /app
RUN npm install --save
WORKDIR /app/dist
RUN mkdir /app/tmp
EXPOSE 3000
ENTRYPOINT [ "node", "main.js" ]