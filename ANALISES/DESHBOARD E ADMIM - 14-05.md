Implementar sistema de acesso administrativo protegido para o dashboard da barbearia.

OBJETIVO:
Criar uma área administrativa privada onde apenas usuários com acesso de admin possam visualizar e gerenciar a agenda de agendamentos.

REGRAS IMPORTANTES:
- Usuários comuns NÃO podem acessar a agenda.
- O dashboard deve ser protegido.
- Não permitir criação pública de conta admin.
- Admin entra apenas com email e senha cadastrados manualmente.
- O sistema deve funcionar no MESMO site de agendamento.
- Visual moderno e profissional.
- Fluxo simples e seguro.

ESTRUTURA:

# Área Pública
Usuários comuns podem acessar:
- Home
- Serviços
- Equipe
- Contato
- Agendamento

Sem acesso à agenda administrativa.

---

# Área Administrativa
Criar rota protegida:

/admin/login

Tela simples contendo:
- Email
- Senha
- Botão Entrar

Sem:
- cadastro
- registro público
- recuperação de senha (por enquanto)

---

# Dashboard Protegido
Após login admin:

/dashboard

Apenas admins podem acessar.

Se usuário não for admin:
- bloquear acesso
- redirecionar para "/"

---

# Middleware de Proteção
Implementar proteção nas rotas:

/dashboard/*
/admin/*

Validar:
- sessão ativa
- role admin

Exemplo:
role:
- client
- admin

---

# Funcionalidades do Dashboard

Mostrar:
- Agenda do dia
- Horários confirmados
- Pendentes
- Cancelados
- Finalizados

Lista de horários:
09:00 - João
10:00 - Lucas
11:00 - Carlos

Ações:
- Confirmar
- Cancelar
- Finalizar

---

# Layout do Dashboard

Sidebar:
- Dashboard
- Agenda
- Clientes
- Horários
- Configurações

Área principal:
- Cards de resumo
- Lista de agendamentos
- Status dos horários

---

# Segurança
- Usuário comum nunca deve visualizar a agenda.
- Dashboard acessível apenas via login admin.
- Proteger rotas com middleware.
- Salvar sessão admin com cookie/token.

---

# Estrutura de Rotas

/admin/login
/dashboard
/dashboard/agenda
/dashboard/clientes
/dashboard/config

---

# Objetivo Final
Criar um sistema profissional de gerenciamento de agenda para barbearia, mantendo:
- site público para clientes
- dashboard privado para admin
- segurança
- organização
- facilidade de uso
-

# Admin System — Status Atual 14-05

## ✅ Feito Hoje

### Banco de Dados (Supabase)
- Migration `002_admin_policies.sql`
- Função `check_is_admin()`
- RLS Policies para admin
- Coluna `role` na tabela `profiles`

### Frontend (Next.js)
- `MenuSheet.tsx` → Item “Painel Admin” condicional
- `MenuSheet.tsx` → Busca role via Supabase client-side
- `AdminDashboard.tsx` → UI no estilo do app
- `AdminDashboard.tsx` → Gerenciamento de agendamentos
- Middleware protegendo `/admin`
- `getCurrentUserRole()`
- `getAllAppointments()`
- `getAdminStats()`

### Acesso
- SQL para promover usuário a admin
- Usuário admin confirmado

---

# ❌ Problemas

## 1. Painel Admin não aparece
### Possíveis causas
- Sessão expirada
- `useEffect` não atualizando
- Problema de RLS
- Cookies do Supabase não compartilhados

### Debug
```js
const supabase = require('@supabase/supabase-js')
  .createClient('URL', 'KEY');

supabase.auth.getUser()
  .then(r => console.log(r.data.user));

supabase
  .from('profiles')
  .select('role')
  .eq('id', 'SEU_USER_ID')
  .single()
  .then(r => console.log(r));