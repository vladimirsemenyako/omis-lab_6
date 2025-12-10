# Этап сборки
FROM node:18-alpine as builder

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
# Используем npm install вместо npm ci, так как package-lock.json может отсутствовать
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Production образ
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=builder /app/build /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открытие порта
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]

