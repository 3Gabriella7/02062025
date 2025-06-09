const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
const { body, validationResult } = require("express-validator"); // Biblioteca para validação e sanitização

const app = express();

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database("users.db");

// Criação das tabelas, caso não existam
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, titulo TEXT, conteudo TEXT, data_criacao TEXT)"
  );
});

// Configuração da sessão para controlar login dos usuários
app.use(
  session({
    secret: "senhaforte", // Chave secreta para a sessão
    resave: true,          // Regrava a sessão mesmo sem modificações (pode ajustar conforme necessidade)
    saveUninitialized: true, // Salva sessões novas mesmo sem dados (pode ajustar conforme necessidade)
  })
);

// Configura pasta para arquivos estáticos (css, imagens, js)
app.use("/static", express.static(__dirname + "/static"));

// Habilita o parse do body para dados vindos em formulários HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Define o motor de template EJS para as views
app.set("view engine", "ejs");

// --- Rotas ---

// Rota principal
app.get("/", (req, res) => {
  console.log("GET /");
  res.render("pages/index", { titulo: "Index", req: req });
});

// Rota sobre
app.get("/sobre", (req, res) => {
  res.render("pages/sobre", { titulo: "Sobre", req: req });
});

// Rota dashboard — só acessível se usuário estiver logado
app.get("/dashboard", (req, res, next) => {
  console.log("GET /dashboard");
  if (req.session.loggedin) {
    const query = "SELECT * FROM users";
    // Busca todos usuários para exibir no dashboard
    db.all(query, [], (err, rows) => {
      if (err) return next(err); // Passa erro para o middleware de erro centralizado
      res.render("pages/dashboard", { titulo: "Dashboard", dados: rows, req: req });
    });
  } else {
    res.redirect("/nao_autorizado");
  }
});

// Página para acesso não autorizado
app.get("/nao_autorizado", (req, res) => {
  res.render("pages/nao_autorizado", { titulo: "Não autorizado", req: req });
});

// Página de formulário para criação de post - só para usuários logados
app.get("/post_create", (req, res) => {
  console.log("GET /post_create");
  if (req.session.loggedin) {
    // Passa objeto vazio de erros e dados para a view, para o formulário funcionar bem
    res.render("pages/post_form", { titulo: "Criar postagem", req: req, errors: null, data: {} });
  } else {
    res.redirect("/nao_autorizado");
  }
});

// POST para criação de post com validação dos dados
app.post(
  "/post_create",
  [
    // Validação e sanitização usando express-validator
    body("titulo").trim().notEmpty().withMessage("Título é obrigatório").escape(),
    body("conteudo").trim().notEmpty().withMessage("Conteúdo é obrigatório").escape(),
  ],
  (req, res, next) => {
    console.log("POST /post_create");

    // Só permite se estiver logado
    if (!req.session.loggedin) {
      return res.redirect("/nao_autorizado");
    }

    // Pega erros da validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Se tem erros, reexibe o formulário com mensagens e valores preenchidos
      return res.render("pages/post_form", {
        titulo: "Criar postagem",
        req: req,
        errors: errors.array(),
        data: req.body,
      });
    }

    // Se tudo ok, insere no banco de dados
    const { titulo, conteudo } = req.body;
    const data_criacao = new Date().toISOString();

    const query = "INSERT INTO posts (id_users, titulo, conteudo, data_criacao) VALUES (?, ?, ?, ?)";

    // Use db.run para insert, e o callback para capturar erro ou sucesso
    db.run(query, [req.session.id_username, titulo, conteudo, data_criacao], (err) => {
      if (err) return next(err); // Passa erro para middleware de erro
      res.send("Post criado com sucesso!");
    });
  }
);

// Rota logout — destrói sessão e redireciona
app.get("/logout", (req, res) => {
  console.log("GET /logout");
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Página de cadastro - envia vazio para formulário
app.get("/cadastro", (req, res) => {
  console.log("GET /cadastro");
  res.render("pages/cadastro", { titulo: "Cadastro", req: req, errors: null, data: {} });
});

// POST para cadastro com validação e sanitização
app.post(
  "/cadastro",
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Nome de usuário obrigatório")
      .isAlphanumeric()
      .withMessage("Nome de usuário deve ser alfanumérico")
      .escape(),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Senha obrigatória")
      .isLength({ min: 6 })
      .withMessage("Senha deve ter ao menos 6 caracteres")
      .escape(),
  ],
  (req, res, next) => {
    console.log("POST /cadastro");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Se tem erro na validação, renderiza a página cadastro com os erros e dados preenchidos
      return res.render("pages/cadastro", {
        titulo: "Cadastro",
        errors: errors.array(),
        data: req.body,
        req: req,
      });
    }

    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username=?";

    db.get(query, [username], (err, row) => {
      if (err) return next(err);

      if (row) {
        console.log(`Usuário: ${username} já cadastrado`);
        return res.redirect("/Cadastrado");
      }

      const insert = "INSERT INTO users (username, password) VALUES (?, ?)";
      db.run(insert, [username, password], (err) => {
        if (err) return next(err);
        console.log(`Usuário: ${username} cadastrado com sucesso.`);
        res.redirect("/sucesso");
      });
    });
  }
);

// Página avisando que usuário já foi cadastrado
app.get("/Cadastrado", (req, res) => {
  res.render("pages/jacadastrado", { titulo: "Cadastrado", req: req });
});

// Página sucesso
app.get("/sucesso", (req, res) => {
  res.render("pages/sucesso", { titulo: "Sucesso", req: req });
});

// POST para login com validação
app.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Nome de usuário obrigatório").escape(),
    body("password").trim().notEmpty().withMessage("Senha obrigatória").escape(),
  ],
  (req, res, next) => {
    console.log("POST /login");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/login", {
        titulo: "Login",
        errors: errors.array(),
        data: req.body,
        req: req,
      });
    }

    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username=? AND password=?";

    db.get(query, [username, password], (err, row) => {
      if (err) return next(err);

      if (row) {
        req.session.loggedin = true;
        req.session.username = username;
        req.session.id_username = row.id;
        res.redirect("/dashboard");
      } else {
        res.redirect("/invalido");
      }
    });
  }
);

// Página login - envia vazio para formulário
app.get("/login", (req, res) => {
  console.log("GET /login");
  res.render("pages/login", { titulo: "Login", req: req, errors: null, data: {} });
});

// Página login inválido
app.get("/invalido", (req, res) => {
  res.render("pages/invalido", { titulo: "Inválido", req: req });
});

// Middleware para rota não encontrada (404)
app.use((req, res) => {
  res.status(404).render("pages/fail", { titulo: "ERRO 404", req: req, msg: "Página não encontrada" });
});

// Middleware para tratamento centralizado de erros — evita repetição de catch em cada rota
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render("pages/error", {
    titulo: "Erro",
    mensagem: err.message || "Erro interno do servidor",
    req: req,
  });
});

app.get('/search', (req, res) => {
  const searchTerm = req.query.q;

  // Consulta ao banco de dados para buscar posts cujo título ou conteúdo contenham o termo de busca
  db.all(
    'SELECT * FROM posts WHERE title LIKE ? OR content LIKE ?',
    [`%${searchTerm}%`, `%${searchTerm}%`],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
      } else {
        res.render('posts', { posts: rows });
      }
    }
  );
});

app.listen(3000, () => {
<<<<<<< HEAD
    console.log(`Servidor NODEjs ativo na porta 3000`);
    console.log(__dirname + "\\static");
})

=======
  console.log("Servidor NODEjs ativo na porta 3000");
});
>>>>>>> 72031250a256b7bf88e366390158dd0bf771ee1d
