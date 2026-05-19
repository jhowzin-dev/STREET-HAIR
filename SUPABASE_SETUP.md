  # Configuração do Supabase

Este projeto está preparado para usar Supabase como banco de dados.

## Passos para configurar:

### 1. Criar projeto no Supabase
1. Acesse https://supabase.com
2. Crie uma conta (ou faça login)
3. Crie um novo projeto
4. Anote a **URL** e a **ANON KEY** das configurações

### 2. Configurar variáveis de ambiente
1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edite o `.env.local` e substitua com suas chaves:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANONKey=sua-chave-anon-aqui
   ```

### 3. Executar as migrações
1. No painel do Supabase, vá em **SQL Editor**
2. Copie o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
3. Cole no SQL Editor e execute

Ou use a CLI do Supabase:
```bash
npx supabase db push
```

### 4. O que já está configurado:
- ✅ Tabela de usuários
- ✅ Tabela de profissionais
- ✅ Tabela de serviços
- ✅ Tabela de agendamentos
- ✅ Dados iniciais (profissionais e serviços)

### 5. Quando o cliente criar o Supabase:
1. Só substituir as chaves no `.env.local`
2. Executar a migração SQL
3. Pronto! O app estará conectado

## Teste sem Supabase
O app funciona atualmente com dados em memória (mock). Quando configurar o Supabase, os dados reais serão usados automaticamente.
