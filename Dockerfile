# Fase 1: Construindo a aplicação
FROM node:18-alpine AS build

WORKDIR /app

#Copiando o arquivo package.json e o package-lock.json para instalar as dependências
COPY package.json package-lock.json ./

#Instalando dependências
RUN npm install

#Copiando todos os arquivos do projeto
COPY . .

#Construindo a aplicação para produção
RUN npm run build

#Fase 2: Servindo a aplicação com Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

#Expondo a porta usada pelo Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]