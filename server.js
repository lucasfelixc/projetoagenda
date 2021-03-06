require('dotenv').config();

//Express: {
const express = require('express');
const app = express();
const mongoose = require('mongoose');
//}

//Conexão na base de dados: {
mongoose.connect(process.env.CONNECTIONSTRING, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false 
    })
.then(() => {
    app.emit('pronto');
}).catch(e => console.log(e));
//}

//Criação das sessions no banco de dados: {
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

//Flash messages: {
const flash = require('connect-flash');
//}


const routes = require('./routes');
const path = require('path');

//Segurança: {
const helmet = require('helmet');
const csrf = require('csurf');
//}

//Middlewares: {
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middleware/middleware');
//}

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionsOptions = session({
    secret: 'nomeSecreto123',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
});

app.use(sessionsOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());

app.use(csrfMiddleware);
app.use(checkCsrfError);
app.use(middlewareGlobal);
app.use(routes);

app.on('pronto', () => {
    app.listen(3000, () => {
        console.log('Acessar http://localhost:3000');
        console.log('Servidor executando na porta 3000');
    });
});
