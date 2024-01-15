import passport from "passport";
import local from "passport-local";
import jwt from "passport-jwt";
import userModel from "../dao/models/user.model.js";
import "dotenv/config.js";
import Cart from '../dao/models/carts.model.js';
import { createHash, isValidPassword } from "../utils.js";
const LocalStrategy = local.Strategy;

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) => {
let token = null;
if (req && req.cookies) {
    token = req.cookies["access_token"];
}
return token;
};

const initializePassport = () => {

passport.use(
    "register",
    new LocalStrategy(
    { passReqToCallback: true, usernameField: "email" },
    async (req, username, password, done) => {
        const { name,last_name, email,age } = req.body;
        try {
        let user = await userModel.findOne({ email: username });
        if (user) {
            console.log("Usuario ya existe");
            return done(null, false);
        }
        const today = new Date();
        const birthYear = parseInt(age.substring(0, 4));
        const currentYear = today.getFullYear();
        const current_age = currentYear - birthYear;
        if(current_age< 18){
            return done("user is underage")
        }
        const cart =new Cart({username:name}); 
        const newCart = await cart.save(); 
        const newUser = {
            name,
            last_name,
            email,
            age:current_age,
            password: createHash(password),
            cart_id:newCart._id
        };
        let result = await userModel.create(newUser);
        return done(null, result);
        } catch (error) {
        return done("Error al obtener usuario" + error);
        }
    }
    )
);

    passport.use(
    "login",
    new LocalStrategy(
    { usernameField: "email" },
    async (username, password, done) => {
        try {
        let user = await userModel.findOne({ email: username });
        if (!user) {
            console.log("Usuario no existe ");
            return done(null, false);
        }

        if (!isValidPassword(user, password)){
            return done(null, false);}
        return done(null, user);
        } catch (error) {
        return done(error);
        }
    }
    )
);

passport.use(
    "jwt",
    new JWTStrategy(
    {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.KEYSECRET,
    },
    async (jwt_payload, done) => {

        try {

        return done(null, jwt_payload);
        } catch (error) {

        return done(error);
        }
    }
    )
);

};
passport.serializeUser((user, done) => {
done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
let user = await userModel.findById(id);
done(null, user);
});

export default initializePassport;