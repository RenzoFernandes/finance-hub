# FinanceHub

FinanceHub é um sistema SaaS de gerenciamento de finanças pessoais criado com Next.js App Router, Prisma e PostgreSQL. A aplicação permite acompanhar saldo, receitas, despesas, categorias, metas financeiras, relatórios e exportações em uma interface moderna, responsiva e em português do Brasil.

## Tecnologias

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Docker Compose
- Recharts
- Sonner
- Lucide React
- shadcn/ui

## Funcionalidades

- Autenticação com login, cadastro, sessão via cookie HTTP-only e conta demo
- Dados financeiros separados por usuário
- Dashboard com saldo total, receitas, despesas, economia do mês, alertas, metas e gráficos
- Transações com criação, listagem, edição, exclusão, filtros, busca e exportação CSV
- Categorias com criação, edição, exclusão protegida e cores
- Metas financeiras com valor alvo, valor atual, prazo, progresso e status
- Relatórios com filtros, resumo financeiro, maior categoria de despesa, média de gastos, tabela detalhada e exportação PDF
- Layout dark mode, responsivo e com navegação mobile

## Conta Demo

Após rodar o seed:

```txt
E-mail: demo@financehub.com
Senha: demo123456
```

## Como Rodar Localmente

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/financehub?schema=public"
```

Suba o banco com Docker:

```bash
docker compose up -d
```

Aplique as migrations e rode o seed:

```bash
npx prisma migrate dev
npm run db:seed
```

Inicie o servidor:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

## Docker

O projeto usa Docker Compose para o PostgreSQL local:

```bash
docker compose up -d
docker compose down
```

Verifique o `docker-compose.yml` para porta, usuário, senha e nome do banco.

## Prisma

Comandos úteis:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate status
npm run db:seed
npx prisma studio
```

## Qualidade

Valide o projeto antes de publicar:

```bash
npm run lint
npm run build
```

## Screenshots

Adicione imagens do projeto em `public/screenshots` e substitua os placeholders abaixo:

- `public/screenshots/dashboard.png`
- `public/screenshots/transacoes.png`
- `public/screenshots/relatorios.png`

## Melhorias Futuras

- Recuperação de senha
- Convites e múltiplas contas por workspace
- Orçamentos mensais por categoria
- Importação OFX/CSV
- Recorrência de transações
- Testes automatizados end-to-end
- Deploy com pipeline CI/CD
