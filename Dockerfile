FROM node:10
WORKDIR /app
COPY ./* /app/
RUN npm install
CMD ["npm", "start"]
EXPOSE 8085