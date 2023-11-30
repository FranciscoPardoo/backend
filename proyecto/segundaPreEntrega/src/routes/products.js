const express = require('express');
const router = express.Router();
const ProductManagerMongo = require('../dao/ProductManagerMongo'); 

const productManagerMongo = new ProductManagerMongo();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            sort: sort === 'desc' ? { price: -1 } : sort === 'asc' ? { price: 1 } : null,
        };

        const filter = query ? { category: query } : {};

        const products = await productManagerMongo.getAllProducts(filter, options);
        const totalProducts = await productManagerMongo.getTotalProducts(filter);

        const totalPages = Math.ceil(totalProducts / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
        const nextPage = hasNextPage ? parseInt(page) + 1 : null;

        const prevLink = hasPrevPage ? `/products?page=${prevPage}&limit=${limit}` : null;
        const nextLink = hasNextPage ? `/products?page=${nextPage}&limit=${limit}` : null;

        const result = {
            status: 'success',
            payload: products,
            totalPages,
            prevPage,
            nextPage,
            page: parseInt(page),
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        };

            res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

router.get('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        const product = await productManagerMongo.getProductById(productId); 
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        const createdProduct = await productManagerMongo.createProduct(newProduct); 
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ error: 'Datos de producto no válidos' });
    }
});

router.put('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        const updatedProductData = req.body;
        const updatedProduct = await productManagerMongo.updateProduct(productId, updatedProductData);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: 'Datos de producto no válidos' });
    }
});

router.delete('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
    await productManagerMongo.deleteProduct(productId); 
    res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

module.exports = router;