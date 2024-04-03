const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Conexión establecida con la base de datos');
});

db.on('error', (err) => {
    console.error(`Error de conexión a la base de datos: ${err.message}`);
});

module.exports = db;