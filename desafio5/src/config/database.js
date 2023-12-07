import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://ffranpardo30:87LlUsNRiXoWzhEk@ecommerce.93yr8pn.mongodb.net/')


const db = mongoose.connection

db.on('error',console.error.bind(console,"Error conecting to the databse:"));
db.once('open',()=>{
    console.log("Successfully connected :D")
})

export{mongoose,db}