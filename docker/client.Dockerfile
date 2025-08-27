FROM node:20-alpine AS build

WORKDIR /app

# Build arguments
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID  
ARG VITE_AUTH0_AUDIENCE
ARG VITE_AUTH0_REDIRECT_URI

# Debug: ARGs ausgeben (werden zur Build-Zeit angezeigt)
RUN echo "Build ARG VITE_AUTH0_DOMAIN: $VITE_AUTH0_DOMAIN"
RUN echo "Build ARG VITE_AUTH0_CLIENT_ID: $VITE_AUTH0_CLIENT_ID"

# Environment variables setzen
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}
ENV VITE_AUTH0_REDIRECT_URI=${VITE_AUTH0_REDIRECT_URI}

COPY package*.json ./
RUN npm install

COPY . .
RUN chmod +x node_modules/.bin/* && npx vite build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]