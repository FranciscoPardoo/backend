import express from 'express';
import {ProductManager} from '../ProductManager.js'
import { uploader } from '../utils.js';
const productRouter =express.Router();

const pMI = new ProductManager(); 

productRouter.get('/',(req,res)=>{
    const array =pMI.getProductFromFile();
    const new_text={};
    let limites= req.query.limit;
    if(limites > array.length){
        new_text["error"] ="Solicitud fuera de alcance";
        res.status(404).json({message:new_text})
    }
    if(limites >0 && limites <= array.length){
        for (let i =0; i<=limites-1; i++){
            new_text[`Item ${i+1}`]=array[i]
        }
        res.status(200).json({Response:new_text})
    }
});

productRouter.get('/:idproduct',(req,res)=>{ 
    const productId =parseInt(req.params.idproduct,10);
    const array =pMI.getProductFromFile();
    const product = array.findIndex(product =>product.id === productId);
    const display_text ={}
    if(product === -1){
        res.status(404).json({Error: `Producto por ID ${productID} no fue encontrado`});
    }else{
        display_text[`Item ${product+1}`]=array[product];
        res.status(200).json({Response:display_text})
    }
});

productRouter.post('/',uploader.single('thumbnail'),(req,res)=>{ 
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
        res.status(201).json({newProduct:array[array.length-1]})}
    else{
        res.status(400).json({Error:`Item ${newProduct.title} por codigo ${newProductCode} ya en la base de datos`,Item_Similar:array[duplicate]})
    }
});

productRouter.put('/:idproduct',uploader.single('thumbnail'),(req,res)=>{
    const updatedProduct =req.body;
    const productId =parseInt(req.params.idproduct,10);
    const array =pMI.getProductFromFile();
    const product = array.findIndex(product =>product.id === productId);
    if(product === -1){
        res.status(404).json({Error: `Producto por ID ${productID} no fue encontrado`});
    }else{
        const exist=req.file
        if(exist){
            updatedProduct["thumbnail"]=`${exist.destination}/${exist.filename}`
        }
        pMI.updateProductById(product+1,updatedProduct)
        const array =pMI.getProductFromFile();
        res.status(201).json({Updated:array[product]})
    }
});

productRouter.delete('/:idproduct',(req,res)=>{ 
    const productId =parseInt(req.params.idproduct,10);
    const array =pMI.getProductFromFile();
    const product = array.findIndex(product =>product.id === productId);
    if(product === -1){
        res.status(404).json({Error: `Producto por ID ${productID} no fue encontrado`});
    }else{
        pMI.deleteProductById(product+1)
        const array =pMI.getProductFromFile();
        res.status(201).json({Updated:array})
    }
});

export {productRouter}; 