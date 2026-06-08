# Control Cycle

Caderno digital do Método de Ovulação Billings (MOB).

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (Auth + Postgres + RLS)
- **Zod** + **React Hook Form** (validações)
- **date-fns** (cálculo de dia do ciclo)
- **jsPDF** + **jspdf-autotable** (exportação PDF)
- **Lucide React** (ícones)

## Configuração

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. No painel: **Project Settings → API**, copie a URL e a chave `anon`.

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `.env.local` com os valores do seu projeto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SEU_ANON_KEY
```

### 3. Executar a migration no Supabase

No painel do Supabase: **SQL Editor → New query**, cole o conteúdo de
`supabase/migrations/0001_init.sql` e execute.

Isso cria as tabelas (`profiles`, `cycles`, `notes`), os triggers de RLS e
o trigger que cria o perfil automaticamente no signup.

### 4. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura principal

```
src/
  app/
    (auth)/         # Login e Signup
    (app)/          # Layout autenticado
      page.tsx      # Home
      anotacao/     # Nova anotação + edição
      grafico/      # Gráfico do ciclo (tabela MOB)
      historico/    # Histórico de ciclos
      ciclos/       # Meus Ciclos (criar/editar/encerrar)
      manual/       # Manual MOB
      perfil/       # Perfil da usuária
  components/
    chart/          # CycleChart + MobSymbol
    forms/          # NoteForm
    nav/            # AppNav
    ui/             # Button, Input, Select, Card, Textarea
  lib/
    mob/            # symbols.ts, options.ts, cycle.ts
    pdf/            # exportCycle.ts
    supabase/       # client.ts, server.ts
    validation/     # note.ts (Zod schemas)
  types/
    db.ts           # Tipos TypeScript do banco
supabase/
  migrations/
    0001_init.sql   # Schema + RLS
```

## Regras de negócio implementadas

| Regra | Descrição |
|-------|-----------|
| 1 | Sensação obrigatória para salvar anotação |
| 2 | Aparência obrigatória para salvar anotação |
| 3 e 4 | Uma anotação por data por ciclo (constraint `UNIQUE (cycle_id, data)`) |
| 5 | Dia do ciclo calculado automaticamente a partir da data inicial |
| 6 | Só pode haver um ciclo ativo por usuária |
| 7 | Nenhuma tela exibe interpretação automática de fertilidade/ápice |
| 8 | Símbolos MOB são selecionados manualmente pela usuária |
| 9 | Exportação PDF disponível em Gráfico e Histórico |
