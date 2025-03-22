# Use an official node.js runtime as a parent image
FROM node:22-alpine

# Set the workdir in the container
WORKDIR /app

# Copy json files to the conteiner
COPY package*.json .

# Install dependecies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port that the app runs
EXPOSE 3333

# Define the command to run the app
CMD ["node","./src/server.js"]