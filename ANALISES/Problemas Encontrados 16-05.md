
## 1. Profile não salva nome automaticamente

### Status:

🟡 Parcialmente resolvido

### Problema:

- Usuário cria conta
- Auth cria normalmente
- Profiles cria linha
- Mas `full_name` não salva no cadastro inicial
- Quando edita manualmente depois, salva corretamente

### Possível causa:

- Trigger `handle_new_user`
- ou metadata `full_name`
- ou race condition entre trigger e signUp()

### Resolver depois:

- Revisar `signUp()`
- Revisar `raw_user_meta_data`
- Possivelmente usar apenas `upsert()`
- Verificar se trigger realmente recebe `full_name`

---

## 2. Cadastro não possui telefone

### Status:

🔴 Pendente

### Falta:

- Campo telefone na tela de cadastro
- Salvar telefone no profile

### Fazer:

- Adicionar input telefone
- Máscara BR
- Salvar no `profiles.phone`

---

## 3. Professionals duplicados

### Status:

🔴 Pendente

### Problema:

- Seed rodou mais de uma vez
- Existem barbeiros duplicados

### Fazer:

- Limpar tabela professionals
- Adicionar proteção no seed
- Garantir nomes únicos

### SQL provável:

```
delete from professionals;
```

Depois recriar corretamente.

---

## 4. Seleção de data não abre horários automaticamente

### Status:

🟡 Regressão visual/comportamental

### Problema:

Antes:

- Selecionava data
- Scroll/abertura automática dos horários

Agora:

- Só abre clicando manualmente
- Presets ("Hoje", "Amanhã") funcionam

### Fazer:

- Restaurar UX anterior
- Abrir seção de horários automaticamente
- Restaurar animações/transições

---

## 5. Histórico de agendamentos

### Status:

🟡 Parcialmente implementado

### Atualmente:

- Appointment salva
- Appointment aparece no banco

### Falta:

- Separar:
    - futuros
    - concluídos
    - cancelados

### Ideia:

Appointment só entra no histórico quando:

- status = completed  
    OU
- horário já passou

---

## 6. Fluxo de conclusão automática

### Status:

🔴 Ainda não implementado

### Ideia:

Após:

- horário passar
- +40min

Appointment:

```
confirmed -> completed
```

### Possíveis soluções:

- Cron job
- Edge Function
- Trigger
- Verificação no dashboard admin

---

## 7. Sistema Admin

### Status:

🟡 Pausado temporariamente

### Fazer depois:

- Middleware admin
- Dashboard admin
- Controle de status
- Finalizar appointments
- Ver agenda completa
- CRUD services
- CRUD professionals

---

# 📌 Próximas Prioridades

## PRIORIDADE ALTA

- [x]  Corrigir full_name no cadastro
- [x]  Adicionar telefone no cadastro
- [x]  Corrigir professionals duplicados
- [x]  Restaurar UX da seleção de horários

---

## PRIORIDADE MÉDIA

- [x]  Melhorar histórico
- [x]  Separar appointments futuros/concluídos
- [ ]  Auto-complete de agendamentos

---

## PRIORIDADE FUTURA

- [ ]  Sistema admin completo
- [ ]  Dashboard
- [ ]  Analytics
- [ ]  Push notifications
- [ ]  WhatsApp
- [ ]  Pagamentos
- [ ]  Upload avatar
- [ ]  Sistema de avaliações