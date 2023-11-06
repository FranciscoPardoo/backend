import fs from 'fs'


class ProductManager {
    constructor(path) {
        this.products = [];
        this.path = path || "productos.json"
        this.code = 0; 

    }

    addProduct(product) { 
        const data = fs.readFileSync(this.path, 'utf-8');
        const array = JSON.parse(data);
        if(data.length <= 2){this.code = 1}
        else{this.code = array[array.length-1].id +1;}
        
        const prod = {
            id: this.code,
            title: product.title,
            description: product.description,
            code:product.code,
            price: product.price,
            status:product.status || true,
            stock: product.stock,
            category: product.category,
            thumbnail: product.thumbnail || "Imagen sin cargar" 
        };
        array.push(prod);
        fs.writeFileSync(this.path, JSON.stringify(array), 'utf-8')

    }
    getProductFromFile() {
        const data = fs.readFileSync(this.path, 'utf-8');
        if (data.length < 1) {
            fs.writeFileSync(this.path, JSON.stringify(this.products), 'utf-8')
            const data = fs.readFileSync(this.path, 'utf-8');
            return console.log(`Datos vacios:${
                JSON.parse(data)
            }`);
        } else {
            try {
                const data = fs.readFileSync(this.path, 'utf-8');
                const array = JSON.parse(data);
                return array;
            } catch (error) {
                return 'no puedo ver el archivo '
            }
        }
    }
    getProductById(id) {
        const data = fs.readFileSync(this.path, 'utf-8');
        const prods = JSON.parse(data);
        const product_index = prods.findIndex(x => {
            return x.code === id
        });

        if (! product_index) {
            return console.log(`\nItem con id: ${id} no encontrado`);
        } else {
            console.log(`\nItem con id: ${id}`);
            console.log(prods[product_index]);
        }
    }

    updateProductById(id, new_product) {
        const data = fs.readFileSync(this.path, 'utf-8');
        const prods = JSON.parse(data);
        const index = prods.findIndex(x => {
            return x.id === id
        });

        if (index < 0) {
            return console.log(`\nNo podemos actualizar la identificación: ${id} \Item no encontrado\n`)
        } else {
            const product = prods[index];
            for (const new_key in new_product) {
                if (product[new_key] !== undefined) {
                    product[new_key] = new_product[new_key];
                } else {
                    console.log(`\nLa clave : {${new_key}} no forma parte del diccionario, por lo que no podemos actualizar su valor.`)
                }
            }
            prods[index] = product;
            fs.writeFileSync(this.path, JSON.stringify(prods), 'utf-8');
        }
    }

    deleteProductById(id) {
        const data = fs.readFileSync(this.path, 'utf-8');
        const prods = JSON.parse(data);
        const index = prods.findIndex(x => {
            return x.id === id
        });
        if (index < 0) {
            return console.log(`\nItem por ID: ${id} no se encontró, no se puede eliminar\n`);
        } else {
            console.log("ADVERTENCIA SOBRE ELIMINAR UN ELEMENTO, ESTO NO SE PUEDE DESHACER");
            prods.splice(index, 1);
            fs.writeFileSync(this.path, JSON.stringify(prods), 'utf-8');
            console.log(". . . . * ELIMINADO*");
        }
    }
}

export {ProductManager};