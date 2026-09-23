# ⚔️ Chronicles - RPG Campaign & Character Manager

**Chronicles** é uma plataforma web moderna para criação, acompanhamento e gerenciamento em tempo real de fichas de personagens e campanhas de RPG de mesa.

O sistema tem como regras primárias o **Sistema Daemon / Tormenta Daemon** (atributos com pontuações percentuais, aprimoramentos, perícias com testes dinâmicos de ataque/defesa, foco e caminhos de magia, pontos heroicos/status, armaduras com IP multifacetado, familiares e bestiário completo), construído sob uma arquitetura desacoplada e modular para viabilizar suporte a outros sistemas de regras no futuro.

---

## 🌟 Principais Funcionalidades

- **Ficha de Personagem Completa (Daemon)**:
  - Atributos base (CON, FOR, DES, AGI, INT, PER, WILL, CAR) com cálculo de testes percentuais (x1 a x5) e alocação de pontos de criação.
  - Pontos vitais e de status (Pontos de Vida, Magia, Fé, PSI, Heroicos e Will).
  - Gestão de Perícias agrupadas por categorias com testes de ataque/defesa e bônus dinâmicos.
  - Aprimoramentos Positivos e Negativos parametrizados com custo/ganho de pontos.
  - Grimório e Foco de Magia (Caminhos Elementais e Arcanos: Criar, Controlar, Entender).
  - Proteções e Armaduras com cálculo de Índice de Proteção (Cinético, Balístico, Escudo, Psíquico, Mágico e Durabilidade).
  - Inventário, tesouros, familiares, montarias e companheiros.

- **Gestão de Campanhas & Dashboard do Mestre**:
  - Painel do Mestre (DM Dashboard) com visão geral dos jogadores e personagens vinculados.
  - Diário de sessão, anotações de campanha e histórico de acontecimentos.
  - **Fluxo de Revisão do Mestre (DM Review)**: alterações feitas por jogadores em campanhas ativas passam por aprovação do Mestre (`isPendingDMReview`).

- **Bestiário Integrado**:
  - Catálogo de monstros e NPCs com estatísticas prontas para combate e encontros.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React |
| **Backend** | Java 21, Spring Boot 3.x, Spring Data JPA, Spring Security, Validation |
| **Banco de Dados** | Supabase PostgreSQL |
| **Migrations** | Flyway (Versionamento do schema via código) |
| **Documentação da API** | OpenAPI 3.0 / Swagger UI (Springdoc) |

---

## 🏗️ Arquitetura do Repositório

```text
chronicles/
├── backend/              # Aplicação Spring Boot (Java 21)
│   ├── src/main/java/    # Controllers, Services, Repositories, Entities, DTOs
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/ # Scripts SQL versionados do Flyway (V1, V2, etc.)
├── frontend/             # Aplicação SPA React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Telas, modais e componentes de UI
│   │   ├── services/     # Clientes de comunicação HTTP/API
│   │   └── types.ts      # Interfaces TypeScript
│   └── public/           # Assets visuais e imagens otimizadas
├── regras/               # Documentação detalhada das regras do Sistema Daemon
└── .planning/            # Planejamento, Roadmap e especificações arquiteturais
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** (v18+ recomendado) e **npm** ou **bun**
- **Java JDK 21** e **Maven** (para o backend)
- Conta no [Supabase](https://supabase.com) (ou instância PostgreSQL local)

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Acesse a aplicação em `http://localhost:5173`.

### 2. Backend
Configure as variáveis de conexão com o banco no `backend/src/main/resources/application.yml` ou via variáveis de ambiente:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Execute o Spring Boot:
```bash
cd backend
mvn spring-boot:run
```
O Flyway executará as migrações automaticamente no banco de dados e a documentação do Swagger estará acessível em `http://localhost:8080/swagger-ui.html`.

---

## 📋 Metodologia & Governança

O projeto utiliza o fluxo **Get-Shit-Done (GSD)** com rastreabilidade estruturada em [.planning/](file:///.planning/) e diretrizes para agentes de IA documentadas em [.agents/AGENTS.md](file:///.agents/AGENTS.md).
