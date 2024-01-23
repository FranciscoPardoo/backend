import express from "express"
import handlebars from 'express-handlebars'
import path from 'path';
import __dirname from './utils.js';
import session from 'express-session';
import cors from "cors"
import mongoConnect from "./db/db.mongo.js"
import MongoStore from 'connect-mongo'
import "dotenv/config.js";
import  {Server}  from "socket.io";
import cookieParser from 'cookie-parser'
import router from "./routes/router.js"
import CartModel from "./dao/models/carts.model.js";
import Product from "./dao/models/products.model.js";

const app = express();
const port =3000;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
mongoConnect();

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());

app.use(session({
    secret:process.env.KEYSECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl:process.env.MONGODB_URL,
        ttl: 4*120,
        autoRemove:"native"    
    }),
}));

router(app);

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send("Something went wrong here");
})

const httpServer =app.listen(port,()=>{
    console.log(`Current port ${port}`)
})

const io = new Server(httpServer);
let current_user="";
let role=""
io.on('connection',async(socket)=>{
    
    socket.on("update_user", (data)=>{
        current_user=data.name;
        role=data.role
    })
    
        let user=current_user;
        const preload_cart = (await CartModel.find({username:`${user}`}))[0]
        if(preload_cart === undefined){
        }
        else if(preload_cart.products.length >0){
            console.log("items found")
            socket.emit("cart_updated",[{username:`${user}`},preload_cart])
        }else{socket.emit("list_user",{username:`${user}`})} 

    socket.on("add_to_cart",async (data)=>{
        console.log(role)
        if(role==="ADMIN"){
            socket.emit("ADMIN");
            return;
        }else{
        let user =current_user
        const get_cart= (await CartModel.find({username:`${user}`}))[0]
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
        const result = await CartModel.updateOne({
            username:`${user}`},
            get_cart
            );
        console.log(get_cart)
        socket.emit("cart_updated",[{username:`${user}`},get_cart])}
    })

    socket.on("remove_from_cart",async (data)=>{
        let user =current_user
        const get_cart= (await CartModel.find({username:`${user}`}))[0]
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
        const result = await CartModel.updateOne({
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

export default io