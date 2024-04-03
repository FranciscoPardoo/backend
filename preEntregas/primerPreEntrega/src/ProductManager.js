const fs = require('fs');

class ProductManager {
constructor(path) {
    this.path = path;
    this.products = this.loadProducts();
}

loadProducts() {
    try {
    const data = fs.readFileSync(this.path, 'utf-8');
    return JSON.parse(data);
    } catch (error) {
    return [];
    }
}

saveProducts() {
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
}

getProducts() {
    return this.products;
}

getProductById(id) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
    throw new Error("Producto no encontrado");
    }
    return product;
}
}

module.exports = ProductManager;