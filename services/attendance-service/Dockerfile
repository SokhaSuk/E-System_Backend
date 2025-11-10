FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build
EXPOSE 4004
CMD ["npm", "start"]

