const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    res.status(201).json({ message: 'Carrito creado con éxito', cartId: 12345 });
});

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    res.json({ cartId, products: ['producto1', 'producto2'] });
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    res.status(201).json({ message: 'Producto agregado al carrito con éxito' });
});

module.exports = router;