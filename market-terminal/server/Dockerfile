FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY index.js .
EXPOSE 3001
CMD ["node", "index.js"]
