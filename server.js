require("dotenv").config();
const express = require("express"); //Importar paquete
const app = express(); //Inicializar nuestra app
const http = require("http"); //Importar Http
const server = http.createServer(app); //Crear servidorcoi
const logger = require("morgan"); //Error handler
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const Keys = require("./config/keys");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const upload = require('./middlewares/upload');
const uploadVaccine = require('./middlewares/uploadVaccine');

const bodyParser = require("body-parser");

// Configurar el análisis de cuerpo extendido para admitir datos JSON y formularios URL-encoded
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());



/*
 * RUTAS
 */
const users = require("./routes/usersRoutes");
// const wp = require('./whats-app/whatsapp');

// if(process.env.NODE_ENV !== 'production')

const port = process.env.PORT || 3000; //Definir puerto que escucha nuestro servidor
app.use(logger("dev")); //Logger para desarrollo para debugar erroes
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));



app.use(cookieParser(Keys.secretOrKey));
app.use(session({
    secret: Keys.secretOrKey,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/home/developer/uploads/pets/', express.static('/home/developer/uploads/pets/'));
const staticFolderPath = path.join(__dirname, 'uploads/pets/');
const staticFolderPathPerson = path.join(__dirname, 'uploads/person/');
app.use('/uploads/pets/', express.static(staticFolderPath));
app.use('/uploads/person/', express.static(staticFolderPathPerson));

require("./config/passport")(passport);

app.disable("x-powered-by");

app.set("port", port); //Confiturar puerto

//Llamandoa las rutas
users(app, upload, uploadVaccine);

// server.listen(3000,'10.14.50.181' || 'localhost', function(){
server.listen(app.get("port"), function () {
  console.log("Aplicacion de NodeJS " + port + " Iniciada...");
});

app.get("/", (req, res) => {
  res.send("Ruta raiz del backend para SMARTHEALTH");
});

//  ERROR HANDLER
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.stack);
});
