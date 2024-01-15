import express from 'express';
import Cart from '../dao/models/carts.model.js'
import { productRouter } from './products.router.js';


import io from '../app.js'
import Product from '../dao/models/products.model.js';


const Cartrouter =express.Router();

Cartrouter.get('/:id',async (req, res)=>{
    try{
        const carts= await Cart.findById(req.params.id).lean();
        res.render('index',{
            layout:'cart'
            ,carts})
    }catch(error){
        res.status(500).json({message:error.message})
    }
})

Cartrouter.delete("/:cid/products/:pid",async (req,res)=>{
    try{
        const cid= req.params.cid;
        const pid =req.params.pid;
        const get_cart = await Cart.findById(cid)
        const user=get_cart.username
        console.log("reading current cart",get_cart)
        const index=get_cart.products.findIndex(x=>{
            console.log(JSON.stringify(x.product))
            return JSON.stringify(x.product)===`"${pid}"`});
        console.log(index)
        const product = get_cart.products[index]

        get_cart.products.splice(index,1)
        get_cart.total = get_cart.total -(product.price*product.quantity);
        const result = await Cart.updateOne({
            username:"DummyCart"},
            get_cart
            );
        console.log("Item removed ")
        io.emit("cart_updated",[{username:user},get_cart])
        res.status(201).json({item_removed:product})
}catch(error){
    res.status(501).json({Error:"Id of item or Cart not found"})
}

})

Cartrouter.put("/:cid",async (req,res)=>{
    try{
    const cid= req.params.cid;
    const get_cart = await Cart.findById(cid)
    const user=get_cart.username
    get_cart.username=req.body.username
    const result = await Cart.updateOne({
        username:user},
        get_cart,
        );
    res.status(201).json({Cart_Updated:get_cart})}
    catch(error){
        res.result(501).json(error)
    }
})

Cartrouter.put("/:cid/products/:pid",async (req,res)=>{
    try{
        const cid= req.params.cid;
        const pid =req.params.pid;
        const product_indata=await Product.findById(pid)
        const get_cart = await Cart.findById(cid)
        const user=get_cart.username

        let current_total=0
        for(let item in get_cart.products){
            current_total+= get_cart.products[item].price*get_cart.products[item].quantity }

        const index=get_cart.products.findIndex(x=>{
            console.log(JSON.stringify(x.product))
            return JSON.stringify(x.product)===`"${pid}"`});
        const product = get_cart.products[index]

        if(req.body.quantity === product.quantity){
            io.emit("cart_updated",[{username:user},get_cart])
            res.status(201).json({Message:"Item is already this quantity not updating"})
        }
        else if (req.body.quantity > product_indata.stock){
            io.emit("not_enough")
            res.status(501).json({Message:"Not enought items to fulfill the request"})
        }
        else if(req.body.quantity<1){
            get_cart.products[index].quantity=req.body.quantity
            let new_total=0
            for(let item in get_cart.products){
                new_total+= get_cart.products[item].price*get_cart.products[item].quantity}
            get_cart.total = new_total;
            get_cart.products.splice(index,1)
            const result = await Cart.updateOne({
                username:"DummyCart"},
                get_cart
                );
            console.log("Item removed ")
            io.emit("cart_updated",[{username:user},get_cart])
            res.status(201).json({item_removed:product})
        }
        else if(req.body.quantity<product.quantity){
            get_cart.products[index].quantity=req.body.quantity
            let new_total=0
            for(let item in get_cart.products){
                new_total+= get_cart.products[item].price*get_cart.products[item].quantity}
            get_cart.total = new_total;
            const result = await Cart.updateOne({
                username:"DummyCart"},
                get_cart
                );
            console.log("Item Updated ")
            io.emit("cart_updated",[{username:user},get_cart])
            res.status(201).json({item_updated:product})
        }
        else{
            get_cart.products[index].quantity=req.body.quantity
            let new_total=0
            for(let item in get_cart.products){
                new_total+= get_cart.products[item].price*get_cart.products[item].quantity}
            get_cart.total = new_total;
            const result = await Cart.updateOne({
                username:user},
                get_cart
                );
            console.log(get_cart)
            console.log("Item updated ")
            io.emit("cart_updated",[{username:user},get_cart])
            res.status(201).json({item_updated:product})
        }
    }catch(error){
        res.status(501).json({Error:"Item ID or Cart was not found"})
    }
})


Cartrouter.delete("/:cid",async (req,res)=>{
    try{
    console.log("Cleaning list")
    const cid= req.params.cid;
    const get_cart = await Cart.findById(cid)
    const user=get_cart.username
    
    if(get_cart.products.length===0){
        res.status(501).json({Message:"Theres nothing to clean"})
    }
    else{
    console.log("before",get_cart)
    get_cart.products=[]
    let new_total=0
        for(let item in get_cart.products){
            new_total+= get_cart.products[item].price*get_cart.products[item].quantity}
    get_cart.total = new_total;
    console.log("after",get_cart)
    const result = await Cart.updateOne({
        username:user},
        get_cart
        );
    console.log(get_cart)
    console.log("Cart updated ")
    io.emit("cart_updated",[{username:user},get_cart])

    res.status(201).json({squeaky_clean:get_cart})
        }
    }catch(error){res.status(501).json({Error:"ID of the cart was not found"})}
})

export default Cartrouter;


