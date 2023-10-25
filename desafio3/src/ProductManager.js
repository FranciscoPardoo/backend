import { promises as fs } from 'fs';

export class ProductManager {
    constructor(path) {
    this.path = path;
}

async getProducts(limit) {
    const products = await this.readProducts();
    if (limit) {
        return products.slice(0, limit);
    }
    return products;
}

async getProductById(id) {
    const products = await this.readProducts();
    const product = products.find((p) => p.id === id);
    return product || null;
}

async readProducts() {
    try {
        const data = await fs.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}
}

export default ProductManager;