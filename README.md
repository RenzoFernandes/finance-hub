<h1 align="center">
  <br>
  FinanceHub
  <br>
</h1>

<h4 align="center">Um sistema SaaS de gerenciamento de finanças pessoais moderno e responsivo.</h4>

<p align="center">
  <a href="#sobre-o-projeto">Sobre</a> •
  <a href="#principais-funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#como-executar">Como Executar</a> •
  <a href="#deploy-na-nuvem">Deploy</a>
</p>

![FinanceHub Dashboard](public/screenshots/dashboard.png)

## 📌 Sobre o Projeto

O **FinanceHub** é um sistema completo para gerenciamento de finanças pessoais. Desenvolvido com uma arquitetura moderna utilizando **Next.js App Router**, o projeto oferece uma interface premium em *Dark Mode*, garantindo a melhor experiência de usuário. Acompanhe suas receitas, despesas, categorize seus gastos e acompanhe suas metas financeiras com gráficos interativos e relatórios detalhados.

---

## ✨ Principais Funcionalidades

- 🔒 **Autenticação Segura:** Login e cadastro com sessões HTTP-only seguras.
- 📊 **Dashboard Interativo:** Visão geral com saldo atual, balanço mensal, alertas e gráficos de desempenho.
- 💸 **Gestão de Transações:** Cadastro, edição, exclusão e filtragem avançada de receitas e despesas.
- 📁 **Categorização:** Crie categorias personalizadas com cores para organizar seus gastos.
- 🎯 **Metas Financeiras:** Estabeleça metas, acompanhe o progresso e o prazo para alcançá-las.
- 📄 **Relatórios Avançados:** Filtre por períodos e exporte dados cruciais para PDF e visualize as informações detalhadas de forma consolidada.
- 📱 **Design Responsivo:** Totalmente adaptado para uso em dispositivos móveis e desktops.

---

## 🛠 Tecnologias

As seguintes ferramentas e tecnologias foram utilizadas na construção do projeto:

- **[Next.js 14+](https://nextjs.org/)** - Framework React (App Router)
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização utilitária
- **[Prisma ORM](https://www.prisma.io/)** - Mapeamento objeto-relacional
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Docker Compose](https://www.docker.com/)** - Containerização para ambiente local
- **[Recharts](https://recharts.org/)** - Gráficos interativos
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes de interface acessíveis e customizáveis

---

## 🚀 Como Executar Localmente

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/en/) (v18+)
- [Docker](https://www.docker.com/) e Docker Compose
- [Git](https://git-scm.com/)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/RenzoFernandes/finance-hub.git
   cd finance-hub
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/financehub?schema=public"
   ```

4. **Inicie o banco de dados com Docker:**
   ```bash
   docker compose up -d
   ```

5. **Sincronize o banco e popule com dados iniciais:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

6. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

Acesse o sistema em `http://localhost:3000`.

> **Conta Demo Local:**
> - **Email:** `demo@financehub.com`
> - **Senha:** `demo123456`

---

## ☁️ Deploy na Nuvem (Vercel & Neon)

O FinanceHub está preparado para ser hospedado gratuitamente e com alta performance utilizando **Vercel** (Front-end/Back-end) e **Neon** (Banco de dados Serverless).

### 1. Banco de Dados (Neon)
1. Crie uma conta no [Neon.tech](https://neon.tech/).
2. Crie um novo projeto/banco de dados.
3. Copie a sua **Connection String** (ex: `postgresql://usuario:senha@ep-nome-do-banco.region.aws.neon.tech/financehub?sslmode=require`).

### 2. Deploy na Vercel
1. Faça login na [Vercel](https://vercel.com/) e importe este repositório do seu GitHub.
2. Nas configurações de **Environment Variables**, adicione:
   - `DATABASE_URL`: *Cole a Connection String da Neon aqui.*
3. Clique em **Deploy**. A Vercel executará o *build* e o *generate* do Prisma automaticamente.
4. Após o deploy, rode o comando `npx prisma db push` e `npm run db:seed` apontando para a sua base de dados da Neon caso não tenha feito as migrações, ou conecte localmente alterando seu `.env` temporariamente para rodar os comandos no banco de produção.

---

## 🔮 Próximos Passos (Roadmap)

- [ ] Recuperação de senha por e-mail.
- [ ] Múltiplos workspaces e contas conjuntas.
- [ ] Orçamentos mensais fixos por categoria.
- [ ] Importação de extratos via arquivos OFX/CSV.
- [ ] Transações recorrentes automáticas.
- [ ] Cobertura de testes automatizados E2E.

---

<p align="center">
Desenvolvido com 💻 por <strong>Renzo Fernandes</strong>
</p>
