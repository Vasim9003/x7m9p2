# Node 24 use panrom, ithula pudhu NPM default aagave irukkum
FROM node:24-slim

WORKDIR /app

COPY package.json ./

# Entha extra force/update command-um thevai illa
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]