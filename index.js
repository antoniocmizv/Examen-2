import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';


// Crear la aplicación de Express
const app = express();
const PORT = 3000;

// Crear el servidor HTTP
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware para manejar JSON
app.use(cors());
app.use(express.json());

const datos = {
    grupos: [
        {
            id: "grupo1",
            valvulas: ["riego1", "riego2"]
        },
        {
            id: "grupo2",
            valvulas: ["riego1", "riego2"]
        },
        {
            id: "grupo3",
            valvulas: ["riego1", "riego2"]
        },
        {
            id: "grupo4",
            valvulas: ["riego1", "riego2"]
        },
        {
            id: "grupo5",
            valvulas: ["riego1", "riego2"]
        }
        
    ],
    lista: []
};

// Configurar Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    // Enviar estado inicial
    socket.emit('initial-state', datos.lista);
    
    // Recibir actualizaciones
    socket.on('update-state', (data) => {
        const index = datos.lista.findIndex(item => item.name === data.item.name);
        if (index !== -1) {
            datos.lista[index].state = data.item.state;
        } else {
            datos.lista.push(data.item);
        }
        
        // Emitir a TODOS los clientes
        io.emit('state-updated', {
            socketId: data.socketId,
            item: data.item
        });

        // Log para debug
        console.log('Estado actualizado:', data.item);
        console.log('Emitiendo a todos los clientes');
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Rutas
app.get('/', (req, res) => {
    res.send('Bienvenido a la REST API con Node.js y import!');
});

app.get('/api/items', (req, res) => {    
    res.json(datos.lista);
});

app.post('/api/items', (req, res) => {
    const newItem = req.body;
    // Buscar si ya existe el item
    const index = datos.lista.findIndex(item => item.name === newItem.name);
    if (index !== -1) {
        // Actualizar el item existente
        datos.lista[index].state = newItem.state;
        res.status(200).json(datos.lista[index]);
    } else {
        // Agregar nuevo item
        newItem.id = Date.now();
        datos.lista.push(newItem);
        res.status(201).json(newItem);
    }
});


// Agregar nuevo endpoint para obtener la configuración
app.get('/api/config', (req, res) => {
    res.json(datos.grupos);
});


// Iniciar el servidor

httpServer.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});