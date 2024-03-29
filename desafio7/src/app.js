import express from 'express'
import handlebars from 'express-handlebars'
import session from 'express-session';
import cookieParser from 'cookie-parser'
import MongoStore from 'connect-mongo'
import "dotenv/config.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import __dirname from './utils.js';
import  Server  from "socket.io";
import mongoose from 'mongoose'
import {db} from "./config/database.js"
import path from 'path';
import Cartrouter from './routers/carts.router.js';
import { productRouter } from './routers/products.router.js';
import indexRouter from './routers/views/index.js';
import loginRouter from './routers/views/loging.js'
import registerRouter from './routers/views/register.js'
import sessionsApiRouter from './routers/api/users.routes.js'
import profileRouter from "./routers/views/profile.js";
import recoveryPassword from "./routers/views/recoverypassword.js";
import Product from './dao/models/products.model.js';
import Cart from './dao/models/carts.model.js';

const app =express();
const port = 3000;
app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());

app.use(session({
    secret:process.env.KEYSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    store: MongoStore.create({
        mongoUrl:process.env.MONGODB_URL,
        ttl: 4*60,
        autoRemove:"native"    
    }),
}));


initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/carts',Cartrouter);
app.use('/api/products',productRouter);

app.use('/',indexRouter);
app.use('/login',loginRouter);
app.use('/register',registerRouter);
app.use("/profile", profileRouter);
app.use('/api/sessions',sessionsApiRouter);
app.use("/recovery", recoveryPassword);


app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send("Something went wrong here");
})
const httpServer =app.listen(port,()=>{
    console.log(`Current port ${port}`)
})

const io = new Server(httpServer);
let current_user="";

io.on('connection',async(socket)=>{
    
    socket.on("update_user", (data)=>{
        current_user=data?.name;
    })
    
        let user=current_user;
        const preload_cart = (await Cart.find({username:`${user}`}))[0]
        if(preload_cart === undefined){
        }
        else if(preload_cart.products.length >0){
            console.log("items found")
            socket.emit("cart_updated",[{username:`${user}`},preload_cart])
        }else{socket.emit("list_user",{username:`${user}`})} 

    socket.on("add_to_cart", async (data)=>{
        let user =current_user
        console.log(user)
        if(user==="ADM1NC0DR"){
            console.log("Admin user has no available cart capabilities");
            socket.emit("not_enough")
        }
        const get_cart= (await Cart.find({username:`${user}`}))[0]
        const product = (await Product.find({_id:data}))[0]
        let total =get_cart.total
        const Current_products = get_cart.products

        let index=get_cart.products.findIndex(x=>{
            return JSON.stringify(x.product)===`"${data}"`});
        if(index > -1){
            console.log("duplication at index",index)
            let duplicated_item = get_cart.products[index]
            if (product.stock > duplicated_item.quantity){
                get_cart.products[index].quantity=duplicated_item.quantity+1;
                let new_total=0
                for(let item in get_cart.products){
                    new_total+= get_cart.products[index].price*get_cart.products[index].quantity}
                get_cart.total = new_total;
            }
            else{
                socket.emit("not_enough")
            }}
        else{

        get_cart.products.push({product:product,name:product.title,thumbnail:product.thumbnail,price:product.price,quantity:1})
        }
        let new_total=0
                for(let item in get_cart.products){
                    new_total+= get_cart.products[item].price*get_cart.products[item].quantity}
        get_cart.total = new_total;
        console.log(`item added to cart` , product)
        const result = await Cart.updateOne({
            username:`${user}`},
            get_cart
            );
        console.log(get_cart)
        socket.emit("cart_updated",[{username:`${user}`},get_cart])
    })

    socket.on("remove_from_cart",async (data)=>{
        let user =current_user
        const get_cart= (await Cart.find({username:`${user}`}))[0]
        const product = (await Product.find({_id:data}))[0]

        const total =get_cart.total

        const index=get_cart.products.findIndex(x=>{
            return JSON.stringify(x.product)===`"${data}"`});
        let item_incart = get_cart.products[index];
        console.log(item_incart.quantity);
        if(item_incart.quantity >1){
            get_cart.products[index].quantity=item_incart.quantity-1;
        }else{
            get_cart.products.splice(index,1)
        }

        let new_total=0
                for(let item in get_cart.products){
                    new_total+= get_cart.products[item].price*get_cart.products[item].quantity}
        get_cart.total = new_total;
        const result = await Cart.updateOne({
            username:`${user}`},
            get_cart
            );
            socket.emit("cart_updated",[{username:`${user}`},get_cart])
    })
    
    socket.on('sort_now', async (data) => {
        console.log("Received", data);
        if(data[1]==="ALL"){
            const redirectURL = `/api/products/`;
            socket.emit('redirect', redirectURL);

        }else{
        const redirectURL = `/api/products/?${data[0]}=${data[1]}`;
        socket.emit('redirect', redirectURL);}
    });
})



export default io;