const express = require ("express");
const session = require ("express-session");
const sqlite3 = require("sqlite3");

const app = express();

//Conexão com o banco de dados
const db = new sqlite3.Database("users.db");

db.serialize(  () => {
    db.run(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
    )
});

//const bodyparser = require("body-parser"); //Versão 4.x.x

app.use(
    session({
        secret: "senhaforte",
        resave: true,
        saveUninitialized: true,
    })
);

app.use('/static', express.static(__dirname + '/static'));

// Configuração Expressa para processar requisição POST com BODY PARAMENTRS
//app.use(bodyparser.urlencoded({extended: true})); // Versão <=4.x.x
app.use(express.urlencoded({extended: true})); // Versão >=5.x.x
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    console.log("GET /")
    //res.send("Alô SESI Sumaré");
    res.render("pages/index", {titulo: "Index"});
    // res.send("<img src='./static/OIP.jfif'/>");
})

// Exercício, criar uma rota para a página Sobre

app.get("/sobre", (req, res) =>{
    res.render("pages/sobre", {titulo: "Sobre"});
    //res.send("Você está na página sobre");
});

app.get("/dashboard", (req, res) => {
    console.log("GET /dashboard")
    if(req.session.loggedin){
    //listar todos os usuarios
    const query = "SELECT * FROM users";
    db.all(query, [], (err, row) => {
        if(err) throw err;
        console.log(JSON.stringify(row));
        res.render("pages/dashboard", {titulo: "Tabela de usuários", dados:row});
    })
    }else{
        res.send("Usuário não logado");
    }
})

app.get("/logout", (req, res) => {
    console.log("GET /logout");
    req.session.destroy(() =>{
        res.redirect("/");
    });
});

app.get("/cadastro", (req, res) => {
    console.log("GET /cadastro")
    res.render("pages/cadastro", {titulo: "Cadastro"});
    //res.send("Você está na página cadastro");
})

app.post("/cadastro", (req, res) => {
    console.log("POST /cadastro")
    //res.render("pages/cadastro");
    //res.send("Você está na página cadastro");
    console.log(JSON.stringify(req.body));
    const {username, password} = req.body

    const query = "SELECT * FROM users WHERE username=?"

    db.get(query, [username], (err, row) => {
        if(err) throw err;

        console.log("Query SELECT do cadastro:", JSON.stringify(row));
        if(row) {
            console.log(`Usuário: ${username} já cadastrado`)
            res.send("Usuário já cadastrado");
        } else {
            const insert = "INSERT INTO users (username, password) VALUES (?,?)"
            db.get(insert, [username, password], (err, row) =>{
                if(err) throw err;

                console.log(`Usuário: ${username} cadastro com sucesso.`)
                res.redirect("/login");
            })
        }
    })
})

// Rota /login para processamento dos daods do formulário de LOGIN no cliente
app.post("/login", (req, res) => {
    console.log("POST /login");
    console.log(JSON.stringify(req.body));
    const{username, password} = req.body;
    //1. Verificar se o usuário existe
    const query = "SELECT * FROM users WHERE username=? AND password=?"
    db.get(query, [username, password], (err, row) =>{
        if(err) throw err;

        console.log(JSON.stringify(row));
        if(row) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect("/dashboard");
        } else {
            res.send("/cadastro");
        }
    })
    //2. Se o usuário existir e a senha é válida no BD, executar processo de login

    //3. Se não, executar processo de negação de login
    //res.render("pages/login");
    //res.send("Você está na página login");
})

app.get("/login", (req, res) => {
    console.log("GET /login");
    res.render("pages/login", {titulo: "Login"});
    //res.send("Você está na página login");
})

app.listen(3000, () => {
    console.log(`Servidor NODEjs ativo na porta 3000`);
    console.log(__dirname + "\\static");
})

