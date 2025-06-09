const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
const { body, validationResult } = require("express-validator");

const app = express();
const db = new sqlite3.Database("users.db");

// Criação das tabelas
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, titulo TEXT, conteudo TEXT, data_criacao TEXT)"
  );
});

// Sessões
app.use(
  session({
    secret: "senhaforte",
    resave: true,
    saveUninitialized: true,
  })
);

// Middlewares
app.use("/static", express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Rotas
app.get("/", (req, res) => {
  res.render("pages/index", { titulo: "Index", req: req });
});

app.get("/sobre", (req, res) => {
  res.render("pages/sobre", { titulo: "Sobre", req: req });
});

app.get("/dashboard", (req, res, next) => {
  if (req.session.loggedin) {
    db.all("SELECT * FROM users", [], (err, rows) => {
      if (err) return next(err);
      res.render("pages/dashboard", {
        titulo: "Tabela de usuários",
        dados: rows,
        req,
      });
    });
  } else {
    res.render("pages/nao_autorizado", {
      titulo: "Não autorizado",
      req,
    });
  }
});

app.get("/post_create", (req, res) => {
  if (req.session.loggedin) {
    res.render("pages/post_form", {
      titulo: "Criar postagem",
      req,
      errors: null,
      data: {},
    });
  } else {
    res.render("pages/nao_autorizado", { titulo: "Não autorizado", req: req });
  }
});

app.post(
  "/post_create",
  [
    body("titulo").trim().notEmpty().withMessage("Título é obrigatório").escape(),
    body("conteudo").trim().notEmpty().withMessage("Conteúdo é obrigatório").escape(),
  ],
  (req, res, next) => {
    if (!req.session.loggedin) return res.redirect("/nao_autorizado");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/post_form", {
        titulo: "Criar postagem",
        req,
        errors: errors.array(),
        data: req.body,
      });
    }

    const { titulo, conteudo } = req.body;
    const data_criacao = new Date().toISOString();
    const query =
      "INSERT INTO posts (id_users, titulo, conteudo, data_criacao) VALUES (?, ?, ?, ?)";

    db.run(
      query,
      [req.session.id_username, titulo, conteudo, data_criacao],
      (err) => {
        if (err) return next(err);
        res.send("Post criado com sucesso!");
      }
    );
  }
);

app.get("/cadastro", (req, res) => {
  res.render("pages/cadastro", {
    titulo: "Cadastro",
    req,
    errors: null,
    data: {},
  });
});

app.post(
  "/cadastro",
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Nome de usuário obrigatório")
      .isAlphanumeric()
      .withMessage("Deve ser alfanumérico")
      .escape(),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Senha obrigatória")
      .escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/cadastro", {
        titulo: "Cadastro",
        errors: errors.array(),
        data: req.body,
        req,
      });
    }

    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return next(err);
      if (row) {
        return res.render("pages/cadastro_invalido", {
          titulo: "Erro no Cadastro",
          req,
        });
      }

      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        (err) => {
          if (err) return next(err);
          res.redirect("/cadastro_sucesso");
        }
      );
    });
  }
);

app.get("/cadastro_invalido", (req, res) => {
  res.render("pages/cadastro_invalido", { titulo: "Erro no Cadastro", req: req });
});

app.get("/cadastro_sucesso", (req, res) => {
  res.render("pages/cadastro_sucesso", { titulo: "Cadastro Concluído", req: req });
});

app.get("/login", (req, res) => {
  res.render("pages/login", { titulo: "Login", req, errors: null, data: {} });
});

app.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Obrigatório").escape(),
    body("password").trim().notEmpty().withMessage("Obrigatório").escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/login", {
        titulo: "Login",
        errors: errors.array(),
        data: req.body,
        req,
      });
    }

    const { username, password } = req.body;
    db.get(
      "SELECT * FROM users WHERE username=? AND password=?",
      [username, password],
      (err, row) => {
        if (err) return next(err);

        if (row) {
          req.session.loggedin = true;
          req.session.username = username;
          req.session.id_username = row.id;
          res.redirect("/dashboard");
        } else {
          res.render("pages/fail", { titulo: "Inválido", req: req });
        }
      }
    );
  }
);

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// 404
app.use((req, res) => {
  res
    .status(404)
    .render("pages/fail", { titulo: "ERRO 404", req, msg: "Página não encontrada" });
});

// Middleware de erro centralizado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render("pages/fail", {
    titulo: "Erro",
    mensagem: err.message || "Erro interno do servidor",
    req,
  });
});

app.listen(3000, () => {
  console.log("Servidor NODEjs ativo na porta 3000");
});
