FROM node

WORKDIR /app

COPY package* .
COPY tsconfig.json .
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]