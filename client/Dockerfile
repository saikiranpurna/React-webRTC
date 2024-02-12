FROM node:18-alpine AS build

WORKDIR /app
COPY . .

RUN echo "fs.inotify.max_user_watches=524288"

RUN npm
RUN npm run build

FROM nginx:1.18-alpine AS deploy

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .

# remove default nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# replace with custom one
COPY nginx/ngnix.conf /etc/nginx/conf.d

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]