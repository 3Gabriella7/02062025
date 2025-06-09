# Projeto Node.js - Blog Simples com Autenticação

Este é um projeto simples feito com Node.js, Express e SQLite para aprender a criar uma aplicação web com autenticação de usuários, criação e visualização de posts. A interface usa EJS para renderizar páginas. O professor já nós orientou para iniciativa e apenas fizemos as melhorias que faltavam, de acordo com os critérios que eles

---

## Tecnologias utilizadas

- Node.js  
- Express  
- SQLite (banco de dados leve)  
- EJS (template engine para views)  
- express-validator (validação e sanitização de dados)  
- express-session (controle de sessão)

---

## Objetivo do projeto

Este projeto tem o objetivo de praticar os conceitos básicos de:

- Autenticação de usuários com sessão  
- Criação e visualização de posts no blog  
- Validação e sanitização de dados para maior segurança  
- Tratamento centralizado de erros  
- Estrutura simples de rotas e views  

---

## Como rodar o projeto

1. Clone o repositório:

git clone https://github.com/MariaBrito44/node.js_tutorial_1.git

2. Entre na pasta do projeto:
cd node.js_tutorial_1

3. Instale as dependências:
npm install

4. Inicie o servidor:
node app.js

5. Abra o navegador e acesse:
http://localhost:3000

----

Principais rotas disponíveis: 
/ — Página inicial (pública)
/login — Página de login
/cadastro — Página para cadastro de novos usuários
/dashboard — Página restrita, acessível apenas para usuários logados
/post_create — Página para criar um novo post (precisa estar logado)
/logout — Finalizar sessão
/nao_autorizado — Página exibida para acesso negado

Estrutura do projeto:
1. app.js — Arquivo principal com as rotas, configuração do servidor e lógica principal

2. views/pages/ — Páginas EJS para renderização do conteúdo HTML

3. static/ — Arquivos estáticos como CSS e imagens

4. users.db — Banco de dados SQLite (gerado automaticamente ao rodar)

----

Funcionalidades implementadas:
Cadastro e login de usuários com sessão ativa
Criação de posts com título, conteúdo e data de criação
Visualização pública dos posts criados
Validação dos campos do formulário para evitar dados vazios
Sanitização dos dados para prevenir ataques XSS
Tratamento centralizado de erros para capturar problemas inesperados
Interface simples e funcional usando EJSS

---
## *02/06/2025:*
1. Reunir os grupos;
2. Escolher um código base de algum integrante do grupo (Maria Brito);
3. Criar e organizar o repositório - Kanbam;
4. Criar branchs;
5. Status de critérios:
Autenticação - OK
Criar posts - OK
Visualizar posts - OK
Tratamento de erros	- Parcial *(arrumado hoje)*
Interface simples - OK
Validação de dados - Parcial *(arrumado hoje)*
Documentação - Faltando (em progresso)
Padrões de codificação - Parcial *(arrumado hoje)*
Controle de versão - OK
Modularidade - Parcial *(arrumado hoje)*
Busca - Não tem
Paginação - Não tem
Admin interface	- Não tem
----------------------------------

## *09/06/2025:*
5. Status de critérios:
Autenticação - OK
Criar posts - OK
Visualizar posts - OK
Tratamento de erros	- OK
Interface simples - OK
Validação de dados - OK
Documentação - Parcial (em progresso)
Padrões de codificação - OK
Controle de versão - OK
Modularidade - OK
Busca - Não tem
Paginação - Não tem
Admin interface	- Não tem