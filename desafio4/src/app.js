import express from 'express'
import handlebars from 'express-handlebars';
import { productRouter } from './routes/products.js';
import { cartRouter } from './routes/cart.js';
import __dirname from './utils.js';
import viewRouter from './routes/view.js';
import {Server} from 'socket.io';
import path from 'path';
import {ProductManager} from './ProductManager.js'


const app =express();
const port =8080;

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/api/products',productRouter);
app.use('/api/carts',cartRouter) ;
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'))
app.use('/', viewRouter);

const httpServer =app.listen(port,()=>{
    console.log(`Escuchando por el puerto: ${port}`)
})
const io = new Server(httpServer);

const pMI = new ProductManager();

io.on('connection', (socket) => {
    console.log("Nuevo cliente en linea");
    socket.on('mesagge',(data)=>{
    })

    socket.on('add_item',(data)=>{
        const newProduct =data;
        const newProductCode =newProduct.code;
        const array =pMI.getProductFromFile();
        console.log("Intentando agregar un nuevo producto")
        const duplicate = array.findIndex(product =>product.code === newProductCode);
        if(duplicate === -1){
            if(data.thumbnail.length>0){
                newProduct["thumbnail"]=`${data.thumbnail}`
            }
            pMI.addProduct(newProduct)
            const array =pMI.getProductFromFile();
            console.log(array[array.length-1])
            io.emit("confirm_add",[true,0,array[array.length-2].id,array[array.length-1]])}
        else{
            console.log(`Error Item ${newProduct.title} por codigo ${newProductCode} ya en la base de datos \nElemento similar`);
            console.log(array[duplicate])
            io.emit("confirm_add",[false,array[duplicate],0,0])

        }
    })
    socket.on('delete',(data)=>{
        console.log("quiero eliminar ",data)
        const array =pMI.getProductFromFile();
        const product = array.findIndex(product =>product.id === Number(data));
        if(product === -1){
            console.log(`No se encontró el artículo por ID ${data}`);
            io.emit('confirm_delete',[false,data])
        }else{
            pMI.deleteProductById(Number(data));
            const array =pMI.getProductFromFile();
            io.emit('confirm_delete',[true,data])
        }
    })

})


export default io;