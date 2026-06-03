# ✂️ StreetHair – Sistema de Agendamento para Barbearia

> Um ecossistema completo e mobile-first projetado para automatizar o fluxo de agendamentos de barbearias, conectando clientes a profissionais de forma ágil, moderna e segura.

---

## ✨ Visão Geral

O **StreetHair** é uma solução digital robusta desenvolvida para eliminar o agendamento manual e a dependência de intermediários. O sistema funciona em duas frentes principais:

*   **Para o Cliente:** Uma experiência fluida baseada em web-apps nativos, onde ele pode escolher serviços, profissionais, gerenciar seu perfil e acompanhar o histórico de agendamentos em tempo real[cite: 2, 5, 7].
*   **Para a Barbearia/Admin:** Um painel gerencial inteligente que permite aos barbeiros e administradores monitorar a agenda do dia, atualizar o status dos serviços e gerenciar o fluxo de trabalho de forma centralizada[cite: 6, 7, 9].

---

## 🛠️ Tecnologias de Ponta

*   **Framework:** [Next.js](https://nextjs.org/) (App Router & Server Actions para alta performance e segurança)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estática e forte em 100% da aplicação para evitar bugs em produção)
*   **Interface (UI):** [Tailwind CSS](https://tailwindcss.com/) + Componentização Atômica focada em responsividade e consistência visual
*   **Banco de Dados & Auth:** [Supabase](https://supabase.com/) (Autenticação segura, persistência de dados e controle de regras de acesso)
*   **Gerenciamento de Estado:** React Hooks personalizados para otimização de renderização e controle de fluxo da UI
*   **Deploy & Infra:** [Vercel](https://vercel.com/) (Integração contínua com builds automáticos e ambiente otimizado na nuvem)

---

## 📂 Arquitetura e Estrutura de Pastas

O projeto adota uma arquitetura modular inspirada em boas práticas de design de software, separando estritamente a interface visual das regras de negócio:

```text
src/
│
├─ components/
│  ├─ ui/           # Componentes atômicos puramente visuais e reutilizáveis (Button, Card, FlexRow)
│  └─ layout/       # Componentes estruturais de página (Header, Footer, NavBar)
│
├─ hooks/           # Hooks personalizados para controle de estado da UI (useBoolean, useLoading, useFormState)
│
├─ lib/
│  ├─ actions/      # Camada de serviços e integração direta com o Supabase
│  ├─ utils/        # Helpers globais (formatadores, buscas por ID, tratamentos de erro)
│  └─ config/       # Configurações globais e centralizadas da aplicação]
│
├─ core/
│  ├─ theme/        # Design System (Tokens de cores, espaçamentos e tipografia)
│  └─ constants/    # Regras e valores de domínio (Status de agendamento, permissões)
│
└─ presentation/
   ├─ pages/        # Definição de rotas e telas do Next.js
   └─ widgets/      # Componentes ricos com lógica de negócio acoplada (DashboardCard, BookingOption)
