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

Consulte o [Guia Completo de Execução e Deployment](docs/DEPLOYMENT.md) para instruções detalhadas sobre desenvolvimento local com Docker Compose, variáveis de ambiente e empacotamento em containers.

### Resumo Rápido

- **Pré-requisitos:** Node.js 20+, Java JDK 21 e Docker.
- **Banco e Storage Local:** `docker compose -f docker/docker-compose.yml up -d` (Postgres na porta 4321, MinIO na 9000).

#### 1. Backend (Spring Boot 3 / Java 21)
```bash
cd backend
./mvnw spring-boot:run   # ou .\mvnw spring-boot:run no Windows
```
O Flyway aplicará as migrações automaticamente no banco de dados e o Swagger estará acessível em `http://localhost:8080/swagger-ui.html`.

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:4000`.

---

## 📋 Metodologia & Governança

O projeto utiliza o fluxo **Get-Shit-Done (GSD)** com rastreabilidade estruturada em [.planning/](file:///.planning/) e diretrizes para agentes de IA documentadas em [.agents/AGENTS.md](file:///.agents/AGENTS.md).
