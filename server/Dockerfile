# Use the official Node.js image with Alpine Linux
FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Expose the port on which the application will run
EXPOSE 8000

# Command to run the application
CMD ["node", "app.js"]
