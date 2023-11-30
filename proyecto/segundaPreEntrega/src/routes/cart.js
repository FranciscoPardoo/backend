const express = require('express');
const router = express.Router();
const CartManagerMongo = require('../dao/CartManagerMongo'); 

const cartManagerMongo = new CartManagerMongo();

router.delete('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    try {
        await cartManagerMongo.removeProductFromCart(cartId, productId); 
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
});


router.put('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const updatedProducts = req.body.products; 
    try {
        await cartManagerMongo.updateCart(cartId, updatedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;
    try {
        await cartManagerMongo.updateProductQuantity(cartId, productId, quantity);              
        res.status(200).json({ message: 'Cantidad de producto actualizada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' });
    }
});

router.delete('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    try {
        await cartManagerMongo.deleteCart(cartId);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    try {
        const cartWithProducts = await cartManagerMongo.getCartWithProducts(cartId);
        res.json(cartWithProducts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos del carrito' });
    }
});

module.exports = router;