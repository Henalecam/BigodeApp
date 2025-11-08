# BarberPro - Sistema de Gestão para Barbearias

Sistema web completo para gestão de barbearias, desenvolvido com Next.js 14, TypeScript, Prisma e PostgreSQL.

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js
- **State:** Zustand
- **Validação:** Zod + react-hook-form

## 📋 Funcionalidades

### Gestão de Agendamentos
- Calendário semanal interativo
- Sistema de slots disponíveis por barbeiro
- Validação de horários de trabalho
- Fluxo completo: criar → confirmar → iniciar → finalizar
- Cálculo automático de comissões

### Gestão de Barbeiros
- CRUD completo de barbeiros
- Configuração de horários de trabalho por dia
- Taxa de comissão personalizada
- Vínculo com serviços oferecidos

### Gestão de Clientes
- Histórico completo de atendimentos
- Total gasto por cliente
- Busca em tempo real

### Serviços e Produtos
- Catálogo de serviços (duração e preço)
- Controle de estoque de produtos
- Alertas de estoque crítico
- Venda de produtos durante atendimento

### Relatórios
- Comissões por barbeiro (filtros por período)
- Faturamento consolidado
- Análise por forma de pagamento
- Top barbeiros do mês

### Dashboard
- Métricas de faturamento (dia/semana/mês)
- Gráfico de tendência (7 dias)
- Próximos atendimentos
- Produtos com estoque baixo

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd BigodeApp
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/barberpro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

4. **Gere o NEXTAUTH_SECRET**
```bash
openssl rand -base64 32
```

5. **Execute as migrations do Prisma**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. **Popule o banco com dados de exemplo (opcional)**
```bash
npm run seed
```

7. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Credenciais de Teste (após seed)
- **Admin:** admin@barberpro.com / Admin123!
- **Barbeiro:** joao@barberpro.com / Barber123!

## 🚢 Deploy

### Railway (Backend + Database)

1. **Crie um novo projeto no Railway**

2. **Adicione PostgreSQL**
   - Novo serviço → Database → PostgreSQL
   - Copie a `DATABASE_URL` gerada

3. **Configure variáveis de ambiente**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=<gerado-com-openssl>
```

4. **Deploy automático**
   - Conecte seu repositório GitHub
   - Railway detecta Next.js automaticamente
   - Build command: `prisma generate && prisma migrate deploy && next build`

### Vercel (Frontend)

1. **Importe o projeto**
   - New Project → Import do GitHub
   - Framework Preset: Next.js (auto-detectado)

2. **Configure variáveis de ambiente**
```env
DATABASE_URL=postgresql://... (mesma do Railway)
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=<mesmo do Railway>
```

3. **Deploy**
   - A Vercel fará deploy automático a cada push na branch `main`
   - Build Command: `next build`
   - Output Directory: `.next`

### Após o primeiro deploy

Execute as migrations no Railway:
```bash
npx prisma migrate deploy
npm run seed  # (opcional, para dados de exemplo)
```

## 📁 Estrutura do Projeto

```
/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   ├── (dashboard)/     # Páginas protegidas
│   └── api/            # API Routes
├── components/
│   ├── ui/             # Componentes shadcn/ui
│   ├── appointments/   # Componentes de agendamentos
│   ├── barbers/        # Componentes de barbeiros
│   ├── clients/        # Componentes de clientes
│   ├── dashboard/      # Componentes do dashboard
│   └── layout/         # Layout e navegação
├── hooks/              # Custom hooks
├── lib/               # Utilitários e configurações
│   ├── validations/   # Schemas Zod
│   ├── auth.ts        # Configuração NextAuth
│   └── prisma.ts      # Cliente Prisma
├── prisma/
│   ├── schema.prisma  # Schema do banco
│   └── seed.ts        # Dados de exemplo
└── types/             # TypeScript types
```

## 🔒 Segurança

- ✅ Autenticação via NextAuth.js
- ✅ Validação server-side com Zod
- ✅ Multi-tenancy (isolamento por barbearia)
- ✅ Proteção de rotas (middleware)
- ✅ TypeScript strict mode
- ✅ Senha com hash bcrypt

## 🎨 Design System

### Cores
- **Primary:** `#1a1a1a` (preto)
- **Secondary:** `#d4af37` (dourado)
- **Success:** `#10b981` (verde)
- **Warning:** `#f59e0b` (amarelo)
- **Danger:** `#ef4444` (vermelho)

### Responsividade
- Mobile: < 768px (menu hambúrguer)
- Tablet: 768px - 1024px
- Desktop: > 1024px (sidebar fixa)

## 📝 Scripts Disponíveis

```bash
npm run dev        # Desenvolvimento local
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run lint       # Lint do código
npm run seed       # Popular banco com dados
```

## 🐛 Troubleshooting

### Erro de conexão com o banco
- Verifique se PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`
- Execute `npx prisma generate`

### Erro de autenticação
- Valide o `NEXTAUTH_SECRET` no `.env`
- Confirme o `NEXTAUTH_URL` está correto
- Limpe cookies do navegador

### Erro de build
- Rode `npm install` novamente
- Delete `.next` e `node_modules`
- Execute `npm install` e `npm run build`

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido por

Sistema criado como MVP completo seguindo as melhores práticas de Next.js, TypeScript e arquitetura full-stack.

