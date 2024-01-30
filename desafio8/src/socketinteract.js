import * as Cart from "./Services/CartService.js"
import * as Product from "./Services/ProductService.js"
import CustomError from "./util/Custom.error.js";
import * as InfoError from "./util/info.error.js"
import EnumError from "./util/enum.error.js";


const socketserv=(io)=>{
    let current_user="";
    let role=""
    io.on('connection',async(socket)=>{
        
        socket.on("update_user", (data)=>{
        console.log("current user",data);
            current_user=data.name;
            role=data.role
        })
        
            let user=current_user;
            const preload_cart = (await Cart.getCart(user))
            if(preload_cart === undefined){
            }
            else if(preload_cart.products.length >0){
                socket.emit("cart_updated",[{username:`${user}`},preload_cart])
            }else{socket.emit("list_user",{username:`${user}`})} 
        
        socket.on("add_to_cart",async (data)=>{
        try{
            if(role==="ADMIN"){
                socket.emit("ADMIN");
                return;
            }else{
            let user =current_user
            const get_cart= (await Cart.getCart(user))
            const product = (await Product.getByID(data))
            let total =get_cart.total
            const Current_products = get_cart.products
            let index=get_cart.products.findIndex(x=>{
                return JSON.stringify(x.product)===`"${data}"`});
            if(index > -1){
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
            const result = await Cart.updateOne({
                username:`${user}`},
                get_cart
                );
            socket.emit("cart_updated",[{username:`${user}`},get_cart])}
        }catch(error){
                CustomError.createError({
                    name:"Cart error",
                    cause:InfoError.generateCartErrorInfo(),
                    message:"error accessing cart",
                    code:EnumError.CART_ERROR
                });        
                return;
        }})

        socket.on("remove_from_cart",async (data)=>{
        try{
            let user =current_user
            const get_cart= (await Cart.getCart(user))
            const product = (await Product.getByID(data))

            const total =get_cart.total
            const index=get_cart.products.findIndex(x=>{
                return JSON.stringify(x.product)===`"${data}"`});
            let item_incart = get_cart.products[index];
            if(item_incart.quantity >1){
                get_cart.products[index].quantity=item_incart.quantity-1;
            }else{
                get_cart.products.splice(index,1)
            }
            let new_total=0
                    for(let item in get_cart.products){
                        new_total+= get_cart.products[item].price*get_cart.products[item].quantity}
            get_cart.total = new_total;
            const result =  Cart.updateOne({
                username:`${user}`},
                get_cart
                );

                socket.emit("cart_updated",[{username:`${user}`},get_cart])
            }catch(error)
            {CustomError.createError({
                name:"Cart error",
                cause:InfoError.generateCartErrorInfo(),
                message:"error accessing cart",
                code:EnumError.CART_ERROR
            });        
            return;}
        
            })
        
        socket.on('sort_now', async (data) => {
            if(data[1]==="ALL"){
                const redirectURL = `/api/products/`;
                socket.emit('redirect', redirectURL);

            }else{
            const redirectURL = `/api/products/?${data[0]}=${data[1]}`;
            socket.emit('redirect', redirectURL);}
        });
    })
}
export default socketserv