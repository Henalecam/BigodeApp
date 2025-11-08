# Prompt para Cursor AI: Sistema de Gestão para Barbearias

## INSTRUÇÃO PRINCIPAL
Você é um assistente de desenvolvimento especializado em criar aplicações full-stack modernas. Seu objetivo é gerar TODO o código necessário para um sistema completo de gestão para barbearias, seguindo as especificações abaixo com MÁXIMA precisão.

---

## OVERVIEW DO PROJETO

**Nome:** BarberPro  
**Tipo:** Micro-SaaS B2B para gestão de barbearias  
**Stack:** Next.js 14+ (App Router), TypeScript, Prisma, PostgreSQL, Tailwind CSS, shadcn/ui

**Propósito:** Sistema web responsivo (mobile-first) para barbearias gerenciarem agendamentos, atendimentos, comissões de barbeiros e controle básico de produtos.

---

## ARQUITETURA TÉCNICA

### Stack Completo
```
Frontend:
- Next.js 14+ com App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui (componentes)
- react-hook-form + zod (validações)
- date-fns (manipulação de datas)
- zustand (state management)

Backend:
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js (autenticação)

Bibliotecas auxiliares:
- axios (requisições)
- clsx / cn (classes condicionais)
- lucide-react (ícones)
```

### Estrutura de Diretórios
Crie a seguinte estrutura COMPLETA:

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── agendamentos/
│   │   │   ├── page.tsx
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── barbeiros/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clientes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── servicos/page.tsx
│   │   ├── produtos/page.tsx
│   │   ├── relatorios/
│   │   │   ├── comissoes/page.tsx
│   │   │   └── faturamento/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── appointments/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── barbers/route.ts
│   │   ├── clients/route.ts
│   │   ├── services/route.ts
│   │   ├── products/route.ts
│   │   └── dashboard/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── calendar/
│   │   ├── WeekCalendar.tsx
│   │   ├── DayView.tsx
│   │   └── TimeSlotPicker.tsx
│   ├── appointments/
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentModal.tsx
│   │   └── AppointmentList.tsx
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── RevenueChart.tsx
│   │   └── TopBarbersTable.tsx
│   ├── barbers/
│   │   ├── BarberCard.tsx
│   │   └── BarberForm.tsx
│   ├── clients/
│   │   ├── ClientCard.tsx
│   │   └── ClientForm.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── MobileNav.tsx
│       └── UserMenu.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations/
│       ├── appointment.ts
│       ├── barber.ts
│       ├── client.ts
│       └── service.ts
├── hooks/
│   ├── useAppointments.ts
│   ├── useBarbers.ts
│   ├── useClients.ts
│   └── useDashboard.ts
├── types/
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

---

## SCHEMA DO BANCO DE DADOS

Implemente EXATAMENTE este schema Prisma:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Barbershop {
  id        String   @id @default(cuid())
  name      String
  phone     String
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users        User[]
  barbers      Barber[]
  clients      Client[]
  services     Service[]
  appointments Appointment[]
  products     Product[]
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  password     String
  name         String
  role         Role       @default(ADMIN)
  barbershopId String
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum Role {
  ADMIN
  BARBER
}

model Barber {
  id             String         @id @default(cuid())
  name           String
  phone          String?
  commissionRate Float          @default(50)
  isActive       Boolean        @default(true)
  barbershopId   String
  barbershop     Barbershop     @relation(fields: [barbershopId], references: [id])
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  appointments  Appointment[]
  workingHours  WorkingHours[]
  barberServices BarberService[]
}

model WorkingHours {
  id        String  @id @default(cuid())
  barberId  String
  barber    Barber  @relation(fields: [barberId], references: [id], onDelete: Cascade)
  dayOfWeek Int
  startTime String
  endTime   String
  isActive  Boolean @default(true)
}

model Client {
  id           String     @id @default(cuid())
  name         String
  phone        String
  email        String?
  notes        String?
  barbershopId String
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  appointments Appointment[]
}

model Service {
  id           String     @id @default(cuid())
  name         String
  duration     Int
  price        Float
  isActive     Boolean    @default(true)
  barbershopId String
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  barberServices       BarberService[]
  appointmentServices  AppointmentService[]
}

model BarberService {
  barberId  String
  serviceId String
  barber    Barber  @relation(fields: [barberId], references: [id], onDelete: Cascade)
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@id([barberId, serviceId])
}

model Appointment {
  id            String            @id @default(cuid())
  date          DateTime
  startTime     String
  endTime       String
  status        AppointmentStatus @default(CONFIRMED)
  notes         String?
  totalValue    Float?
  paymentMethod PaymentMethod?

  clientId     String
  client       Client     @relation(fields: [clientId], references: [id])
  barberId     String
  barber       Barber     @relation(fields: [barberId], references: [id])
  barbershopId String
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id])

  services AppointmentService[]
  products AppointmentProduct[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum AppointmentStatus {
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  CASH
  PIX
  DEBIT
  CREDIT
}

model AppointmentService {
  appointmentId String
  serviceId     String
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  service       Service     @relation(fields: [serviceId], references: [id])
  price         Float

  @@id([appointmentId, serviceId])
}

model Product {
  id           String     @id @default(cuid())
  name         String
  stock        Int        @default(0)
  minStock     Int        @default(5)
  salePrice    Float
  isActive     Boolean    @default(true)
  barbershopId String
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  sales AppointmentProduct[]
}

model AppointmentProduct {
  appointmentId String
  productId     String
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  product       Product     @relation(fields: [productId], references: [id])
  quantity      Int
  unitPrice     Float

  @@id([appointmentId, productId])
}
```

---

## FUNCIONALIDADES OBRIGATÓRIAS

### 1. AUTENTICAÇÃO
- Registro de nova barbearia (cria Barbershop + User admin)
- Login com email e senha
- Proteção de rotas (middleware NextAuth)
- Roles: ADMIN (dono) e BARBER
- Session management

### 2. DASHBOARD PRINCIPAL (/)
**Para ADMIN:**
- Cards de métricas: Faturamento hoje/semana/mês, Total de atendimentos
- Gráfico de faturamento dos últimos 7 dias
- Tabela: Top 3 barbeiros (mais atendimentos)
- Lista de próximos agendamentos do dia
- Alertas: produtos com estoque baixo

**Para BARBER:**
- Ver apenas seus agendamentos do dia
- Suas métricas pessoais (atendimentos, faturamento)

### 3. AGENDAMENTOS (/agendamentos)
**Listar:**
- Calendário semanal (7 dias visíveis)
- Filtro por barbeiro
- Cards por agendamento mostrando: horário, cliente, barbeiro, serviços, status
- Cores por status: verde (confirmado), amarelo (em progresso), cinza (concluído), vermelho (cancelado)

**Criar (/agendamentos/novo):**
- Formulário em steps:
  1. Selecionar barbeiro (lista com avatares)
  2. Selecionar serviço(s) - checkbox múltiplo, mostra duração e valor total
  3. Selecionar data e horário - apenas slots disponíveis baseado em:
     - Horários de trabalho do barbeiro (WorkingHours)
     - Agendamentos já existentes
     - Duração total dos serviços
  4. Selecionar/cadastrar cliente (busca com autocomplete)
  5. Observações opcionais
- Validações completas

**Editar/Detalhes (/agendamentos/[id]):**
- Ver todos os dados
- Ações: Editar, Cancelar, Iniciar Atendimento, Finalizar Atendimento
- Finalizar atendimento abre modal:
  - Confirmar serviços
  - Adicionar produtos vendidos
  - Ajustar valor total
  - Selecionar forma de pagamento
  - Calcular e mostrar comissão do barbeiro

### 4. BARBEIROS (/barbeiros)
**Listar:**
- Cards com: foto, nome, taxa de comissão, status (ativo/inativo)
- Botão criar novo

**Criar/Editar:**
- Formulário: nome, telefone, taxa de comissão (%)
- Horários de trabalho (por dia da semana): hora início, hora fim
- Serviços que realiza (checkboxes)

### 5. CLIENTES (/clientes)
**Listar:**
- Tabela ou cards: nome, telefone, total de atendimentos, último atendimento
- Busca por nome/telefone
- Botão criar novo

**Detalhes (/clientes/[id]):**
- Informações pessoais
- Histórico de atendimentos (lista com data, barbeiro, serviços, valor)
- Total gasto
- Botão editar

### 6. SERVIÇOS (/servicos)
**Listar:**
- Tabela: nome, duração (min), preço, status
- Ações: editar, ativar/desativar

**Criar/Editar:**
- Modal com formulário: nome, duração, preço

### 7. PRODUTOS (/produtos)
**Listar:**
- Tabela: nome, estoque atual, estoque mínimo, preço venda, status
- Destaque visual se estoque < estoque mínimo
- Ações: editar, ativar/desativar

**Criar/Editar:**
- Modal: nome, estoque, estoque mínimo, preço

### 8. RELATÓRIOS
**Comissões (/relatorios/comissoes):**
- Filtro por período e barbeiro
- Tabela: barbeiro, total de atendimentos, valor total gerado, comissão
- Exportar PDF

**Faturamento (/relatorios/faturamento):**
- Filtro por período
- Métricas: total faturado, total por forma de pagamento, total por barbeiro
- Gráfico de linha: faturamento diário no período

---

## REGRAS DE NEGÓCIO CRÍTICAS

### Agendamentos:
1. Não permitir agendar em horário passado
2. Não permitir agendar em horário já ocupado pelo barbeiro
3. Validar se barbeiro trabalha no dia/horário selecionado (WorkingHours)
4. Calcular endTime automaticamente: startTime + soma das durações dos serviços
5. Ao criar, status inicial = CONFIRMED
6. Ao iniciar atendimento, status = IN_PROGRESS
7. Ao finalizar atendimento:
   - Status = COMPLETED
   - Obrigatório: totalValue, paymentMethod
   - Calcular comissão: (totalValue × commissionRate) / 100
   - Se produtos vendidos: reduzir stock

### Barbeiros:
1. commissionRate entre 0-100
2. Ao desativar, não permitir novos agendamentos mas manter histórico
3. Ao criar, obrigatório ter ao menos 1 WorkingHours e 1 serviço vinculado

### Produtos:
1. Ao vender, validar se stock >= quantity
2. Reduzir stock atomicamente (transaction)

---

## VALIDAÇÕES (Zod Schemas)

Crie schemas Zod completos para:
- appointmentSchema (create, update, finalize)
- barberSchema (create, update)
- clientSchema (create, update)
- serviceSchema (create, update)
- productSchema (create, update)

Validações comuns:
- Campos obrigatórios
- Tipos corretos
- Limites (ex: price > 0, duration > 0)
- Formatos (email, telefone brasileiro)

---

## API ROUTES

Implemente TODAS as rotas REST necessárias:

### /api/auth/[...nextauth]/route.ts
- Provider: Credentials
- Verificar email/password com Prisma
- Session com: id, name, email, role, barbershopId

### /api/appointments/route.ts
- GET: listar agendamentos (filtros: date, barberId, status)
- POST: criar agendamento (validar regras de negócio)

### /api/appointments/[id]/route.ts
- GET: detalhes
- PATCH: atualizar (validar status transitions)
- DELETE: deletar (soft delete via status CANCELLED)

### /api/appointments/[id]/finalize/route.ts
- POST: finalizar atendimento (validações especiais)

### /api/barbers/route.ts
- GET: listar barbeiros da barbearia
- POST: criar barbeiro

### /api/barbers/[id]/route.ts
- GET, PATCH, DELETE

### /api/clients/route.ts
- GET: listar com busca
- POST: criar

### /api/clients/[id]/route.ts
- GET (incluir histórico de appointments), PATCH

### /api/services/route.ts
- GET, POST

### /api/services/[id]/route.ts
- PATCH, DELETE

### /api/products/route.ts
- GET, POST

### /api/products/[id]/route.ts
- PATCH, DELETE

### /api/dashboard/route.ts
- GET: retornar todas métricas do dashboard em uma única request

### /api/reports/commissions/route.ts
- GET: dados para relatório de comissões (filtros)

### /api/reports/revenue/route.ts
- GET: dados para relatório de faturamento

**Padrão de resposta:**
```typescript
// Sucesso
{ success: true, data: {...} }

// Erro
{ success: false, error: "Mensagem" }
```

---

## COMPONENTES UI (shadcn/ui)

Instale e use TODOS estes componentes:
- button
- card
- input
- select
- dialog
- calendar
- toast
- badge
- table
- avatar
- dropdown-menu
- tabs
- form
- label
- checkbox
- radio-group
- separator
- sheet (mobile menu)

---

## DESIGN SYSTEM

### Cores (Tailwind Config):
```javascript
colors: {
  primary: {
    DEFAULT: '#1a1a1a',
    foreground: '#ffffff',
  },
  secondary: {
    DEFAULT: '#d4af37',
    foreground: '#000000',
  },
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}
```

### Status Colors:
- CONFIRMED: green-500
- IN_PROGRESS: yellow-500
- COMPLETED: gray-400
- CANCELLED: red-500

### Responsividade:
- Mobile: < 768px (menu hamburguer, cards empilhados)
- Tablet: 768px - 1024px
- Desktop: > 1024px (sidebar fixa)

---

## FEATURES DE UX OBRIGATÓRIAS

1. **Loading States:** Skeleton loaders em todas as listas
2. **Error Handling:** Toast notifications para erros e sucessos
3. **Confirmações:** Dialogs para ações destrutivas (deletar, cancelar)
4. **Optimistic Updates:** UI atualiza antes da resposta da API
5. **Debounce:** Em campos de busca (300ms)
6. **Auto-save:** Não necessário no MVP
7. **Keyboard Shortcuts:** ESC fecha modais
8. **Focus Management:** Primeiro input tem autofocus em formulários

---

## CONFIGURAÇÃO INICIAL

### 1. package.json (dependências):
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "lucide-react": "latest",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### 2. .env.example:
```
DATABASE_URL="postgresql://user:password@localhost:5432/barberpro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### 3. tsconfig.json (strict):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### FASE 1 (MVP Core - semana 1-2):
1. Setup do projeto (Next.js + Prisma + shadcn/ui)
2. Schema do banco + migrations
3. Autenticação completa
4. Layout base (sidebar, header)
5. CRUD de Barbeiros
6. CRUD de Serviços
7. CRUD de Clientes

### FASE 2 (Core Business - semana 2-3):
8. Sistema de Agendamentos (criar, listar, editar)
9. Validação de horários disponíveis
10. Finalizar atendimento
11. Dashboard com métricas básicas

### FASE 3 (Refinamento - semana 3-4):
12. CRUD de Produtos
13. Relatórios (comissões, faturamento)
14. Melhorias de UX
15. Responsividade mobile

---

## COMANDOS PARA EXECUTAR

Após gerar todos os arquivos, o desenvolvedor deve executar:

```bash
# Instalar dependências
npm install

# Instalar shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select dialog calendar toast badge table avatar dropdown-menu tabs form label checkbox radio-group separator sheet

# Configurar Prisma
npx prisma generate
npx prisma migrate dev --name init

# Seed inicial (opcional)
npx prisma db seed

# Rodar desenvolvimento
npm run dev
```

---

## REQUISITOS FINAIS

1. **TypeScript:** 100% tipado, zero `any`, usar tipos do Prisma
2. **Responsive:** Mobile-first, testado em 320px, 768px, 1024px
3. **Performance:** 
   - React Server Components onde possível
   - Client Components apenas quando necessário
   - Lazy loading de modais
4. **Acessibilidade:** 
   - Labels em todos inputs
   - Focus visible
   - Navegação por teclado
5. **Segurança:**
   - Validação server-side obrigatória
   - Multi-tenancy (cada barbearia vê apenas seus dados)
   - CSRF protection (NextAuth)
6. **Code Quality:**
   - Componentes reutilizáveis
   - Custom hooks para lógica compartilhada
   - Comentários apenas em lógica complexa
   - Nomes descritivos

---

## VALIDAÇÃO FINAL

Após gerar todo o código, certifique-se de que:
- [ ] Projeto compila sem erros TypeScript
- [ ] Prisma schema está correto e migrations rodaram
- [ ] Todas as rotas API estão implementadas
- [ ] Todas as páginas do dashboard existem
- [ ] Formulários têm validação Zod
- [ ] Layout é responsivo
- [ ] Autenticação funciona
- [ ] Multi-tenancy está implementado (usuário vê apenas dados da sua barbearia)

---

**IMPORTANTE:** Gere TODOS os arquivos necessários de forma completa e funcional. Não deixe placeholders ou TODOs. O código deve estar pronto para rodar após `npm install` e configuração do .env.