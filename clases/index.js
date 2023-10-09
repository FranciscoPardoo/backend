/* const saludo = "hola";

console.log(saludo)


const miPrimerFuncion = (array) => {
    if(array.length === 0){
        console.log("Lista vacia")
    }else{
        array.forEach(element => {
            console.log(element)
        });
        console.log(array.length);
    }
}

const arr = [];
const arra = ["banana","manzana","naranja","sandia","durazno"];

miPrimerFuncion(arr)
miPrimerFuncion(arra) */

/* class Contador {
    constructor(nombre){
        this.nombre = nombre;
        this.valor = 0;
        Contador.contadorGlobal++;
    }

    incrementar(){
        this.valor++;
    }

    obetenerValor(){
        return this.valor;
    }

    static obtenerContadorGlobal(){
        return Contador.contadorGlobal;
    }
}

Contador.contadorGlobal = 0;

const contador1 = new Contador("responsable1");
const contador2 = new Contador("responsable2");

contador1.incrementar()
contador2.incrementar()
contador2.incrementar()

console.log(`${contador1.nombre}: ${contador1.obetenerValor()}`)
console.log(`${contador2.nombre}: ${contador2.obetenerValor()}`)

console.log(`contador global es: ${Contador.contadorGlobal}`)*/ 

/* const usuario = {
    nombre: "juan",
    eda: 30
}

const entradas = Object.entries(usuario)
console.log(entradas) */

/*     const ventas = [
        {
    manzanas: 3,
    peras: 2,
    carnes: 1,
    jugos:5,
    dulces: 2
        },
        {
    manzanas: 1,
    sandias: 1,
    huevos: 6,
    jugos: 1,
    panes: 4
        }
        ];


    const listaProductos = ventas.map(objetos => Object.keys(objetos))

    console.log(listaProductos)

    const cantProductos = ventas.map(objetos => Object.value(objetos))
     */