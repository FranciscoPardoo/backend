import express from "express";
import ProductManager from "./ProductManager.js";

const app = express();
app.use(express.json());

const productManager = new ProductManager("src/productos.json");

app.get('/products', async (req, res) => {
    try {
        const { limit } = req.query;
        const products = await productManager.getProducts(limit);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
    });

app.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const productId = parseInt(pid);
        const product = await productManager.getProductById(productId);
        if (product) {
        res.json(product);
        } else {
        res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
    });

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});
