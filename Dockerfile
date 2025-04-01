# Используем официальный образ Nginx
FROM nginx:alpine

# Копируем статические файлы сайта в директорию для обслуживания Nginx
COPY ./ /usr/share/nginx/html

# Копируем нашу кастомную конфигурацию Nginx (опционально)
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx в фоновом режиме
CMD ["nginx", "-g", "daemon off;"]
