import express from 'express';
import { ProductManager } from '../ProductManager.js';
import { Server } from 'socket.io';
import { uploader } from '../utils.js';

import io from '../app.js';
const pMI = new ProductManager("./src/data/productos.json"); 

const viewRouter = express.Router();

viewRouter.get('/', (req, res) => {
    const pMI = new ProductManager("./src/data/productos.json");
    const items = pMI.getProductFromFile();
    res.render("index", {
        layout: 'home',
        items
    });
});

viewRouter.get("/realtimeproducts", (req, res) => {
    const pMI = new ProductManager("./src/data/productos.json");
    const items = pMI.getProductFromFile();
    res.render('index', {
        layout: 'realTimeProducts',
        items
    });
});

viewRouter.post("/realtimeproducts",uploader.single('thumbnail'),(req, res) => {
    const newProduct =req.body;
    const newProductCode =newProduct.code;
    const array =pMI.getProductFromFile();
    const duplicate = array.findIndex(product =>product.code === newProductCode);
    if(duplicate === -1){
        const exist=req.file
        if(exist){
            newProduct["thumbnail"]=`${exist.destination}/${exist.filename}`
        }
        pMI.addProduct(newProduct) 
        const array =pMI.getProductFromFile(); 
        console.log(`El nuevo producto es `);
        console.log(array[array.length-1])
        io.emit("confirm_add",[true,0,array[array.length-2].id,array[array.length-1]])
        res.status(201).json({newProduct:array[array.length-1]})
    }
    else{
        console.log(`Artículo de error ${newProduct.title} por código ${newProductCode} ya en la base de datos \nArtículo similar`);
        console.log(array[duplicate])
        io.emit("confirm_add",[false,array[duplicate],0,0])
        res.status(400).json({Error:`Artículo de error ${newProduct.title} por código ${newProductCode} ya en la base de datos \nArtículo similar`,Item_Similar:array[duplicate]})
        
    }
});



viewRouter.delete('/realtimeproducts/:idproduct', (req, res) => { 
    const productId = parseInt(req.params.idproduct, 10);
    const array = pMI.getProductFromFile();
    const product = array.findIndex(product => product.id === productId);
    if (product === -1) {
        console.log(`Item por codigo ${data} no encontrado`);
        io.emit('confirm_delete', [false, data]);
        res.status(404).json({Error:"Error Item no encontrado"})

        } else {
        pMI.deleteProductById(productId);
        const array = pMI.getProductFromFile();
        io.emit('confirm_delete', [true, productId]);
        res.status(200).json({Response:"Item eliminado"})
        }
});


export default viewRouter;