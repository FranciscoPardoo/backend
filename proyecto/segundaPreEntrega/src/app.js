const express = require('express');
const app = express();
const http = require('http').createServer(app); 
const io = require('socket.io')(http); 
const port = 8080;


const Product = require('./models/Product');


app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.static('public'));


app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('home', { products }); 
    } catch (error) {
    res.status(500).send('Error al obtener los productos');
    }
});


io.on('connection', (socket) => {
    console.log('Usuario conectado');
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
});

socket.on('newProduct', async (productData) => {
    try {
        const newProduct = await Product.create(productData);
        io.emit('productAdded', newProduct);
    } catch (error) {
        console.error('Error al agregar el producto:', error);
    }
});

socket.on('deleteProduct', async (productId) => {
    try {
        await Product.findByIdAndDelete(productId);
        io.emit('productDeleted', productId);
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
    }
    });
});


http.listen(port, () => {
console.log(`Servidor escuchando en el puerto ${port}`);
});