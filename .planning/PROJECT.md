# Chronicles - Gerenciador de Fichas e Campanhas de RPG

## Visão Geral
**Chronicles** é um sistema web robusto para criação, gerenciamento e acompanhamento em tempo real de fichas de personagem e campanhas de RPG. O sistema tem como regras primárias o **Sistema Daemon / Tormenta Daemon** (atributos, aprimoramentos, perícias, foco de magia, pontos vitais, IP de armaduras, familiares/companheiros e bestiário), construído sob uma arquitetura desacoplada e extensível para permitir o suporte a outros sistemas no futuro.

---

## Stack Tecnológica

- **Backend:** Java 21, Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security, Validation, Flyway / Liquibase)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React
- **Banco de Dados:** Supabase PostgreSQL (Conexão direta via JDBC / Hibernate JPA)
- **Documentação API:** OpenAPI / Swagger (Springdoc)

---

## Objetivos e Escopo (MVP)

1. **Gestão Completa de Fichas (Daemon)**:
   - Atributos (CON, FOR, DES, AGI, INT, PER, WILL, CAR) com cálculo de % e pontos gastos.
   - Pontos de Status (Vida, Heroicos, Magia, Fé, PSI, Will).
   - Perícias com grupos, subgrupos e cálculo de % total / ataque / defesa.
   - Aprimoramentos Positivos e Negativos.
   - Foco de Magia (Criar, Controlar, Entender) e Caminhos Elementais/Arcanos.
   - Proteções, Armaduras (IP Cinético, Balístico, Escudo, Psíquico, Mágico e Durabilidade).
   - Tesouros, Inventário, Companheiros, Familiares e Montarias.
2. **Gestão de Campanhas & Dashboard do Mestre**:
   - Criação e administração de campanhas (Mestre/DM e Jogadores).
   - Diário de sessão, anotações de campanha e histórico.
   - Sistema de aprovação/revisão de fichas alteradas pelos jogadores (DM Review).
   - Bestiário de NPCs e Monstros integrados.
3. **Persistência e Integração Full-Stack**:
   - Mapeamento ORM/JPA das entidades de Ficha, Usuário, Campanha, Anotação e Bestiário.
   - Endpoints RESTful no Spring Boot com validações e tratamento de erros.
   - Integração transparente do Frontend React (existente) substituindo mock state por chamadas de API reais.

---

## Estrutura de Diretórios do Projeto

```
chronicles/
├── backend/              # Projeto Spring Boot (Java)
│   ├── src/main/java/   # Controllers, Services, Repositories, Entities, DTOs
│   └── src/main/resources/ # application.yml, migrations
├── frontend/             # Aplicação React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis e telas
│   │   ├── services/    # Clientes de API (Axios/Fetch)
│   │   └── types.ts     # Interfaces e DTOs TypeScript
├── regras/               # Documentação técnica das regras do sistema Daemon
└── .planning/            # Artefatos do Get-Shit-Done (GSD)
```
