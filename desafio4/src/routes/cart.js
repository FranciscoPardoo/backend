import express from 'express';
import fs from 'fs'
import {ProductManager} from '../ProductManager.js'
const cartRouter =express.Router();

const cart =[];
let idCounter=0;
const path ='./src/data/carrito.json';
const prodpath='./src/data/productos.json';
let data = fs.readFileSync(path, 'utf-8');
if(data.length <=0){
    console.log("el archivo estaba vacío o no se encontró... escribiendo....")
    fs.writeFileSync(path, JSON.stringify(cart), 'utf-8')
    data = fs.readFileSync(path, 'utf-8');
}
const array = JSON.parse(data);


cartRouter.post('/',(req,res)=>{
    
    if(array.length >0){
        idCounter= array[array.length-1].id+1;
    }
    else{idCounter++}
    
    const cartName = array.findIndex(cart =>cart.name === req.body.name);
    if(cartName ===-1){
    let newCart={
            id:idCounter,
            name:req.body.name,
            products:[]}
        array.push(newCart)
        fs.writeFileSync(path, JSON.stringify(array), 'utf-8')
        res.status(200).json({NEWCART:newCart});}
    else{res.status(401).json({ERROR:`Lamentamos que el carrito llamado [${req.body.name}] ya exista`})}
});

cartRouter.get('/:cid',(req,res)=>{
    const cartId =parseInt(req.params.cid,10);
    const cartIndex = array.findIndex(cart =>cart.id === cartId);
    if(cartIndex === -1){
        res.status(401).json({Error:`No se encontró el carrito por ID ${cartId}`})
    }
    else if(array[cartIndex].products.length === 0){
        res.status(200).json({Response:`El carrito ${array[cartIndex].name} por ID ${cartId} está realmente vacío`});
    }else{
        res.status(200).json(`items en el carrito${cartId}: \n ${array[cartIndex].products}`)
    }
    
});

cartRouter.post('/:cid/product/:pid',(req,res)=>{
    const cartId =parseInt(req.params.cid,10);
    const productID =parseInt(req.params.pid,10);
    const cartIndex = array.findIndex(cart =>cart.id === cartId);
    const productData = fs.readFileSync(prodpath, 'utf-8');
    const arrayP = JSON.parse(productData);
    const productIndex = arrayP.findIndex(product =>product.id === productID);
    console.log("Elemento de índice seleccionado",productIndex+1) 
    if(cartIndex === -1){
        res.status(401).json({Error:`Producto por ID ${productID} no fue encontrado`})
    }
    else{
        if(productIndex ===-1){
            res.status(401).json({Error: `Producto por ID ${productID} no fue encontrado`})
        }
        else{
            const itemIndex = array[cartIndex].products.findIndex(item =>item.ProductID === productID);
            if(itemIndex ==-1){
                const newProduct={
                    ProductID:arrayP[productIndex].id,
                    Quantity:1
            }
            array[cartIndex].products.push(newProduct)
            fs.writeFileSync(path, JSON.stringify(array), 'utf-8')
            res.status(200).json({itemAdded:newProduct})
        }
            else{
                const updateProduct={
                    ProductID:arrayP[productIndex].id,
                    Quantity:array[cartIndex].products[itemIndex].Quantity+1
                }
                array[cartIndex].products[itemIndex]=updateProduct
                fs.writeFileSync(path, JSON.stringify(array), 'utf-8')
                res.status(200).json({itemUpdated:updateProduct})
            }
        }
    }

})

export {cartRouter}; 