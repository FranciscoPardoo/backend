const express = require('express');
const app = express();
const port = 8080;

const ProductManager = require('./ProductManager');
const productManager = new ProductManager('src/data/productos.json');

app.use(express.json());

app.get('/api/products', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

app.get('/api/products/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
        const product = await productManager.getProductById(productId);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = req.body;
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: 'Datos de producto no válidos' });
    }
});

app.put('/api/products/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
        const updatedProductData = req.body;
        res.status(200).json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(400).json({ error: 'Datos de producto no válidos' });
    }
});

app.delete('/api/products/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

app.listen(port, () => {
console.log(`Servidor escuchando en el puerto ${port}`);
});