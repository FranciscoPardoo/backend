const fs = require('fs');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  addProduct(product) {
    const products = this.leerProducts();

    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.thumbnail ||
      !product.code ||
      !product.stock
    ) {
      console.error("Todos los campos son obligatorios.");
      return;
    }

    const nextId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    product.id = nextId;

    products.push(product);

    this.salvarProducts(products);
  }

  getProducts() {
    return this.leerProducts();
  }

  getProductById(id) {
    const products = this.leerProducts();
    const product = products.find((p) => p.id === id);
    return product || null;
  }

  updateProduct(id, updatedProduct) {
    const products = this.leerProducts();

    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      console.error("Producto no encontrado.");
      return;
    }

    products[index] = { id, ...updatedProduct };

    this.salvarProducts(products);
  }

  deleteProduct(id) {
    const products = this.leerProducts();

    const filtroProducts = products.filter((p) => p.id !== id);

    this.salvarProducts(filtroProducts);
  }

  leerProducts() {
    try {
      const data = fs.readFileSync(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  salvarProducts(products) {
    fs.writeFileSync(this.path, JSON.stringify(products, null, 2));
  }
}

const manager = new ProductManager('productos.json');
manager.addProduct({
  title: 'Producto 1',
  description: 'Descripción del producto 1',
  price: 19.99,
  thumbnail: 'imagen1.jpg',
  code: 'P1',
  stock: 10,
});

manager.addProduct({
  title: 'Producto 2',
  description: 'Descripción del producto 2',
  price: 29.99,
  thumbnail: 'imagen2.jpg',
  code: 'P2',
  stock: 15,
});

console.log(manager.getProducts());
manager.updateProduct(1, {
  title: 'Producto Actualizado',
  description: 'Nueva descripción',
  price: 24.99,
});
manager.deleteProduct(2);

console.log(manager.getProducts());
