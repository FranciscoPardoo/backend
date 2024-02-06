import {Router} from "express";
import * as carts from "../Services/CartService.js"
import io from '../app.js'
import CustomError from "../util/Custom.error.js";
import * as InfoError from "../util/info.error.js"
import EnumError from "../util/enum.error.js";

const cartRouter = Router();

cartRouter.get("/",async (req, res)=>{
    if(req.session.user===undefined){
        CustomError.createError({
            name:"User Session error",
            cause:InfoError.generateUserSesErrorInfo(),
            message:"Session has closed",
            code:EnumError.ROUTING_ERROR
        });        
        res.redirect("/")
        return;
    }
    try{
        const current_id =req.session.user._id
        res.redirect(`/api/cart/${current_id}`)

    }catch(error){
        res.status(501).json({message:error.message})
    }
})
cartRouter.get("/:cid",async(req,res)=>{
    try{
    if(req.session.user===undefined){
        CustomError.createError({
            name:"User Session error",
            cause:InfoError.generateUserSesErrorInfo(),
            message:"Session has closed",
            code:EnumError.ROUTING_ERROR
        });        
        res.redirect("/")
        return;
    }
    if(req.params.cid==="ticket"){
        res.redirect("/api/cart/ticket")
    }
    const current_user=req.session.user
    const user_name=req.session.user.name
    const cart= await carts.getCart(req.session.user.name)
    const products = cart.products
    res.render('index',{
        layout:'cart'
        ,cart,current_user})
    }catch(error){
        CustomError.createError({
            name:"User Session error",
            cause:InfoError.generateRoutingErrorInfo(),
            message:"Acess denied",
            code:EnumError.ROUTING_ERROR
        });        
        res.redirect("/")
    }
})
cartRouter.get("/:cid/payment",async(req,res)=>{
    if(req.session.user===undefined){
        CustomError.createError({
            name:"User Session error",
            cause:InfoError.generateRoutingErrorInfo(),
            message:"Acess denied",
            code:EnumError.ROUTING_ERROR
        });        
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