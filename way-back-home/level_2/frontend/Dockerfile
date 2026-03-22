# Use Nginx to serve the static files
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the dist directory
# We assume the build happens OUTSIDE the container (in Cloud Build or locally)
# to simplify injecting environment variables like VITE_API_URL
COPY dist /usr/share/nginx/html

# Expose port 8080 (default for Cloud Run)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
