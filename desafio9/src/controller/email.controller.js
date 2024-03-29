import {Router} from "express"
import transport from "../email.util.js"
import emailConfig from "../config/email.config.js"
import * as tickets from "../services/TicketService.js"
import {v4 as uuidv4} from "uuid"
import * as carts from "../services/CartService.js"
import * as product from "../services/ProductService.js"
import path from 'path';
import { fileURLToPath } from 'url';
import CustomError from "../util/Custom.error.js";
import * as InfoError from "../util/info.error.js"
import EnumError from "../util/enum.error.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const mailRouter =Router();

mailRouter.get("/:cid",async (req,res)=>{
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
    const purchase_datetime = new Date().toISOString();
    const code=uuidv4()
    const cart =await carts.getCart(req.session.user.name)
    const amount =cart.total
    const purchaser=req.session.user.name

    const ticket={
        code:code,
        purchase_datetime:purchase_datetime,
        amount:amount,
        purchaser:purchaser
    }

    const from= emailConfig.emailUser;
    const to=req.session.user.email;
    const subject="Your package is arriving soon"
    let html =`
        <html>
            <img src="cid:store_icon" width="50"/>
            <h3>${purchase_datetime}</h3>
            <h1> Greetings ${purchaser}</h1>
            <p>Your order is ready and it will arrive soon, heres your recipt</p>
            <div>
            <h2>Code</h2>
            ${code}
            <h2>Total</h2>
            ${amount} $ Bells
            </div>
            ---------------Items Bought-----------
        <div>
    `
    for(const item in cart.products){
        html+=`--------------------------
        <h3>${cart.products[item].name}</h3>
        <p>Cost:${cart.products[item].price} bellls
            Quantity:${cart.products[item].quantity}</p>
        `
    }
    html+=`</div></html>`
    const email= await transport.sendMail({
        from:from,
        to:to,
        subject:subject,
        html:html,
        attachments:[{
            filename:'store_icon.png',
            path:path.join(__dirname+'/../img/store_icon.png'),
            cid:'store_icon'
        }]
    })
    const newTicket = await tickets.createTicket(ticket)

    const currentCart =await carts.getCart(req.session.user.name)
    const listproducts =await product.getAll()
            for(const pcart in currentCart.products){
                let item=currentCart.products[pcart]
                let find = await product.getByID(item.product)
                for(const iter in listproducts){
                    let curP=listproducts[iter]
                    if(curP.id===find.id){
                        listproducts[iter].stock=curP.stock-item.quantity
                        let result =await product.updateProduct(find._id,listproducts[iter])
                    }
                }
            }
    
    cart.products=[]
    cart.total=0;
    let result =await carts.emptyCart(cart.id,cart)
    console.log("cart emptied")
    res.redirect("/")


    }catch(error){
        console.log(error)
        res.status(501).json({message:error})
    }
})

export default mailRouter;