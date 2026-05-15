# Finance Hub

> Aplicação web para gerenciamento financeiro pessoal e relatórios, construída com Next.js e Prisma.

**Status:** Em melhorias

---

**Sumário**

- **Descrição:** Uma plataforma para cadastrar transações, categorias, metas e gerar relatórios financeiros.
- **Stack:** Next.js (App Router), TypeScript, Prisma, PostgreSQL, Tailwind CSS.
- **Objetivo:** Fornecer uma base escalável para controle financeiro pessoal e análises simples.

---

**Funcionalidades principais**

- Cadastro e edição de transações (despesas e receitas).
- Gestão de categorias e metas financeiras.
- Dashboard com resumos e gráficos.
- Relatórios exportáveis (CSV/PDF).
- Autenticação multi-usuário.

---

**Tecnologias**

- Next.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Docker / Docker Compose

---

**Pré-requisitos**

- Node.js 18+ instalado
- PostgreSQL (localmente ou via container)
- Git

---

**Instalação e execução (desenvolvimento)**

1. Clone o repositório:

```bash
git clone <repo-url>
cd finance-hub
```

2. Instale dependências:

```bash
npm install
```

3. Configure variáveis de ambiente – crie um arquivo `.env` na raiz com, pelo menos, as chaves abaixo:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:3000
# outras variáveis necessárias (ex.: NEXTAUTH_URL, SECRET_KEY)
```

4. Rode migrações e seed (desenvolvimento):

```bash
npx prisma migrate dev --name init
node prisma/seed.mjs
```

5. Inicie a aplicação:

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

---

**Executando com Docker**

Se preferir usar Docker, há um `docker-compose.yml` pronto no repositório. Para subir os serviços:

```bash
docker compose up --build
```

---

**Scripts úteis (package.json)**

- `npm run dev` : Inicia Next.js em modo desenvolvimento
- `npm run build` : Gera build de produção
- `npm run start` : Inicia servidor em produção
- `npm run lint` : Executa linter

---

**Banco de dados e Prisma**

- O esquema do Prisma está em `prisma/schema.prisma`.
- Migrações estão em `prisma/migrations/`.
- Para aplicar migrações em produção use:

```bash
npx prisma migrate deploy
```

---

**Estrutura principal do projeto**

- `src/app/` – rotas e páginas (App Router)
- `src/components/` – componentes React reutilizáveis
- `prisma/` – esquema e seeds
- `public/` – assets públicos

---

**Boas práticas para contribuições**

- Abra uma issue descrevendo a mudança antes de implementar.
- Crie branches com nome claro: `feat/<descrição>`, `fix/<descrição>`.
- Escreva commits pequenos e claros.
- Adicione testes quando aplicar mudanças significativas.

---

**Deployment**

- Recomendado: plataformas compatíveis com Next.js (Vercel, Railway, Render).
- Certifique-se de configurar `DATABASE_URL` e outras variáveis de ambiente na plataforma de hospedagem.

---

**Licença**

Defina a licença do projeto (ex.: MIT). Atualize este arquivo com a licença escolhida.

---

**Contato**

- Mantenedor: Seu Nome — seu.email@example.com

---

Se quiser, posso:

- Ajustar o README para inglês.
- Incluir badges (build, license, coverage) e screenshots.
- Personalizar instruções de deploy (Vercel / Docker image).

Diga qual desses próximos passos prefere.
