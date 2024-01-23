import {Router} from "express";
import CartsDAO from "../dao/carts.dao.js";
import ProductsDAO from "../dao/products.dao.js";

import io from '../app.js'
const cartRouter = Router();
const carts=new CartsDAO()

cartRouter.get("/:cid",async(req,res)=>{
    if(req.session.user===undefined){
        console.log("oh you have traveled too far, sing in now")
        res.redirect("/")
        return;
    }
    if(req.params.cid==="ticket"){
        res.redirect("/api/cart/ticket")
    }
    const current_user=req.session.user
    const cart= await carts.getCart(req.session.user.name)
    const products = cart.products
    res.render('index',{
        layout:'cart'
        ,cart,current_user})
})
cartRouter.get("/:cid/payment",async(req,res)=>{
    if(req.session.user===undefined){
        console.log("oh you have traveled too far, sing in now")
        res.redirect("/")
        return;
    }
    const current_user=req.session.user
    const cart= await carts.getCart(req.session.user.name)
    const products = cart.products
    console.log("Lets go pay",cart)
    res.render('index',{
        layout:'payment'
        ,cart,current_user})
})

export default cartRouter;