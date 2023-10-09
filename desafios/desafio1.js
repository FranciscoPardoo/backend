class ProductManager {
    constructor() {
        this.products = [];
        this.nextId = 1;
    }

    addProduct(product) {
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

    const codeExiste = this.products.some((existeProduct) => existeProduct.code === product.code);
    if (codeExiste) {
        console.error(`Ya existe un producto con el código ${product.code}.`);
        return;
    }

    const nuevoProduct = {
        id: this.nextId++,
        ...product,
    };
    this.products.push(nuevoProduct);
    }

    getProducts() {
    return this.products;
    }

    getProductById(id) {
    const product = this.products.find((p) => p.id === id);
    if (product) {
        return product;
    } else {
        console.error("Producto no encontrado.");
        return null;
    }
    }
}


const manager = new ProductManager();
manager.addProduct({
    title: "Producto 1",
    description: "Descripción del producto 1",
    price: 2000,
    thumbnail: "imagen1.jpg",
    code: "P1",
    stock: 10,
});

manager.addProduct({
    title: "Producto 2",
    description: "Descripción del producto 2",
    price: 5000,
    thumbnail: "imagen2.jpg",
    code: "P2",
    stock: 15,
});

console.log(manager.getProducts());
console.log(manager.getProductById(1));
console.log(manager.getProductById(3));
