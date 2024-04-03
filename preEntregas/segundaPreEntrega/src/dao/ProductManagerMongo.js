const Product = require('../models/ProductModel'); 

class ProductManagerMongo {
    async getAllProducts() {
        try {
            const products = await Product.find(); 
            return products;
        } catch (error) {
            throw new Error('Error al obtener los productos');
        }
    }

    async addProduct(productData) {
        try {
            const newProduct = await Product.create(productData); 
            return newProduct;
        } catch (error) {
            throw new Error('Error al agregar un nuevo producto');
        }
    }

}

module.exports = ProductManagerMongo;