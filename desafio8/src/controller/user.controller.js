import {Router} from "express";
import * as Users from "../Services/UserService.js"
import * as Cart from "../Services/CartService.js"
import CustomError from "../util/Custom.error.js";
import * as InfoError from "../util/info.error.js"
import EnumError from "../util/enum.error.js";
import "dotenv/config.js";
import { createHash, isValidPassword } from "../utils.js";
import io from "../app.js"
import {  authToken,
    authorization,
    generateToken,
    passportCall, } from "../utils.js";

const UserRouter = Router();

UserRouter.post("/register",async (req,res)  => {
const { name,last_name, email,age,password } = req.body;
    try {
    if (!name || !email || !password){
        
    CustomError.createError({
        name:"User creation error",
        cause:InfoError.generateUserRegErrorInfo({name,last_name,email,age}),
        message:"Error creating the user",
        code:EnumError.USER_ERROR
    });
    res.redirect("/register");
    return;
    }
    let user = await Users.getUser(email);
    if (user) {
        CustomError.createError({
        name:"User creation error",
        cause:"User already exist in database",
        message:"Error creating the user",
        code:EnumError.USER_ERROR
        });        
        res.redirect("/register")
        return;
    }else{
    const today = new Date();
    const birthYear = parseInt(age.substring(0, 4));
    const currentYear = today.getFullYear();
    const current_age = currentYear - birthYear;
    if(current_age< 18){
        CustomError.createError({
        name:"User creation error",
        cause:InfoError.generateUserAgeErrorInfo(),
        message:"Error creating the user",
        code:EnumError.USER_ERROR
        });
        res.redirect("/login");
        return;
    }
    const newCart = await Cart.addCart(name)
    const newUser = {
        name,
        last_name,
        email,
        age:current_age,
        password: createHash(password),
        cart_id:newCart._id
    };
    let result = await Users.addUser(newUser)
    console.log("Success",result)
    res.redirect("/login")}
    } catch (error) {
    console.log(error)
    res.redirect("/register")
    }
});

UserRouter.get("/current", async (req,res) =>{
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
    
    let user_data=req.user.user
    let data = {
    layout: "profile",
    user: user_data,
    };
    console.log("Current user",user_data)
    io.emit("current_user",user_data);
    res.render("index", data);
})

UserRouter.post("/login",async (req,res) =>{
    
    try {
    const { email,password} =req.body;
    if(email === process.env.ADMIN_EMAIL & password ===process.env.ADMIN_PASSWORD){
        req.session.user={name:"ADM1NC0DR",
                        email:process.env.ADMIN_EMAIL,
                        role:"ADMIN"};
        req.session.admin =true
        let user = req.session.user;
        io.emit("current_user",req.session.user);
        io.emit("log_success")
        console.log("pong")
        res.redirect("/profile")
    }else{
        
        let user = await Users.getUser(email);
        if (!user){
        CustomError.createError({
            name:"User Log Error",
            cause:InfoError.generateUserLogError(),
            message:"Error while logging in",
            code:EnumError.USER_ERROR
        });
        return res.redirect("/login")
        }
    else if (!isValidPassword(user, password)){
        CustomError.createError({
        name:"User Log Error",
        cause:InfoError.generateUserLogError(),
        message:"Error while logging in",
        code:EnumError.USER_ERROR
        });
        return res.redirect("/login")
        }
    else{
        console.log("User id found connecting")
        user.password=undefined;
        user.role="User"
        req.session.user=user;
        req.session.admin=false; 
    
        io.emit("current_user",req.session.user);
        io.emit("log_success")
        res.redirect("/profile")
    }
    }
    } catch (error) {
    console.log(error)
    return res.redirect("/");
    }
} )

UserRouter.post("/logout", async (req,res) =>{
    try{
        if(req.session.user){
            delete req.session.user;
            req.session.destroy((error)=>{
            if (error){
                console.log("error clossing current session",error);
                res.status(500).send("Error clossing session",error)
            }else{
                console.log("see you soon")
                res.redirect("/")
            }
        })}
    
    }catch (error){
        console.log("just error at all")
        console.log("Error clossing session",error);
        res.status(500).send("Error clossing session")
    }
}
)

UserRouter.post("/recovery",async (req, res) => {
    try {
    const { email, password } = req.body;

    userServices.resetPass(email,createHash(password))
    res.redirect("/");
    } catch (error) {
    console.error("Error al recuperar contraseña", error);
    res.status(500).send("Error al cerrar la sesión");
    }
});

export default UserRouter;