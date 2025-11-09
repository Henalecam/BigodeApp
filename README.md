# BarberPro - Sistema de Gestão para Barbearias

Sistema web completo para gestão de barbearias, desenvolvido com Next.js 14, TypeScript e dados mockados.

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes com dados em memória (mock)
- **Auth:** NextAuth.js
- **State:** Zustand
- **Validação:** Zod + react-hook-form

## ✨ Características

- ✅ **100% TypeScript** com strict mode
- ✅ **Dados mockados** - sem necessidade de banco de dados
- ✅ **Deploy simplificado** - apenas Vercel
- ✅ **Responsivo** - mobile-first design
- ✅ **Pronto para produção** - build otimizado

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
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/Henalecam/BigodeApp
cd BigodeApp
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

4. **Gere o NEXTAUTH_SECRET**
```bash
openssl rand -base64 32
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Credenciais de Teste
- **Admin:** admin@barberpro.com / Admin123!
- **Barbeiro:** joao@barberpro.com / Barber123!

## 🚢 Deploy na Vercel

### 1. **Prepare o repositório**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. **Importe no Vercel**
- Acesse [vercel.com](https://vercel.com)
- New Project → Import do GitHub
- Selecione o repositório `BigodeApp`
- Framework Preset: **Next.js** (detectado automaticamente)

### 3. **Configure variáveis de ambiente**

No painel do Vercel, adicione:

```env
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=<gerar-com-openssl-rand-base64-32>
```

**⚠️ Importante:** 
- Gere um `NEXTAUTH_SECRET` único para produção
- Use o domínio da Vercel no `NEXTAUTH_URL`

### 4. **Deploy automático**
- A Vercel fará deploy automático
- Cada push na branch `main` = novo deploy
- Preview deploys em pull requests

## 📁 Estrutura do Projeto

```
/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   ├── (dashboard)/     # Páginas protegidas
│   └── api/            # API Routes com mock data
├── components/
│   ├── ui/             # Componentes shadcn/ui
│   ├── appointments/   # Componentes de agendamentos
│   ├── barbers/        # Componentes de barbeiros
│   ├── clients/        # Componentes de clientes
│   ├── dashboard/      # Componentes do dashboard
│   └── layout/         # Layout e navegação
├── hooks/              # Custom hooks
├── lib/
│   ├── mock-db.ts      # 📦 Banco de dados em memória
│   ├── validations/    # Schemas Zod
│   └── auth.ts         # Configuração NextAuth
└── types/             # TypeScript types
```

## 💾 Dados Mockados

O projeto usa um banco de dados em memória (`lib/mock-db.ts`) com:

- 1 Barbearia demo
- 2 Usuários (Admin + Barbeiro)
- 3 Barbeiros
- 5 Clientes
- 4 Serviços
- 3 Produtos
- 5 Agendamentos de exemplo

**Nota:** Os dados são redefinidos quando o servidor reinicia. Para persistência, integre com PostgreSQL/MongoDB ou localStorage.

## 🔒 Segurança

- ✅ Autenticação via NextAuth.js
- ✅ Validação server-side com Zod
- ✅ Multi-tenancy (isolamento por barbearia)
- ✅ Proteção de rotas (middleware)
- ✅ TypeScript strict mode

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
```

## 🐛 Troubleshooting

### Erro de autenticação
- Valide o `NEXTAUTH_SECRET` no `.env.local`
- Confirme o `NEXTAUTH_URL` está correto
- Limpe cookies do navegador

### Erro de build
- Rode `npm install` novamente
- Delete `.next` e execute `npm run build`
- Verifique a versão do Node (18+)

### Dados não persistem
- **Esperado:** dados em memória são perdidos ao reiniciar
- Para produção: considere adicionar localStorage ou banco real

## 🚀 Próximos Passos

Para produção com dados persistentes:

1. **Opção 1: Adicionar PostgreSQL**
   - Restaurar Prisma
   - Conectar ao Railway/Supabase
   - Migrar mock-db para schema.prisma

2. **Opção 2: LocalStorage (limitado)**
   - Salvar `mockDb` no localStorage do navegador
   - Útil apenas para demo single-user

3. **Opção 3: API Externa**
   - Criar API separada com Nest.js/Express
   - Conectar frontend via axios

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido para

MVP completo de sistema de gestão para barbearias, seguindo as melhores práticas de Next.js e TypeScript.

---

**Deploy URL:** https://bigode-app.vercel.app _(exemplo)_
