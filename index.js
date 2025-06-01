require('./src/jobs/inactividad.job');
require('./src/config/conexion.js');
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app.js');

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

global._io = io;

// Configurar eventos de socket
io.on('connection', (socket) => {
  console.log('Cliente conectado', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Usuario ${userId} unido a la sala`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});