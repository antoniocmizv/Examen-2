import express from 'express';
import cors from 'cors';

// Crear la aplicación de Express
const app = express();
const PORT = 3000;

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


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
