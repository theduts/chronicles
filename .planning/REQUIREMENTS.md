# Requisitos do Projeto: Chronicles RPG

## Requisitos Funcionais (FR)

### Backend (Spring Boot & Supabase Postgres)
- **FR-BACK-01**: Estrutura base da API Spring Boot 3.x com Java 21, dependências Maven/Gradle, conexão JDBC com Supabase Postgres, migrations (Flyway/Liquibase) e Swagger UI.
- **FR-BACK-02**: Entidades JPA e Tabelas relacionais para Usuários (`users`), Fichas (`characters`), Campanhas (`campaigns`), Anotações (`notes`), Magias (`spells`) e Monstros/Bestiário (`bestiary_monsters`).
- **FR-BACK-03**: Sistema de Autenticação e Autorização (Registro, Login, Roles: `DM` / `PLAYER`).
- **FR-BACK-04**: Endpoints REST de Fichas de Personagem:
  - GET `/api/characters` (Listar fichas do usuário)
  - GET `/api/characters/{id}` (Obter detalhes completos da ficha)
  - POST `/api/characters` (Criar nova ficha)
  - PUT `/api/characters/{id}` (Atualizar ficha)
  - DELETE `/api/characters/{id}` (Excluir ficha)
  - POST `/api/characters/{id}/submit-review` (Submeter alterações pendentes para o Mestre)
- **FR-BACK-05**: Endpoints REST de Campanhas e Mestre:
  - GET `/api/campaigns` & GET `/api/campaigns/{id}`
  - POST `/api/campaigns` & PUT `/api/campaigns/{id}`
  - POST `/api/campaigns/{id}/players` (Vincular jogador)
  - POST `/api/campaigns/{id}/approve-character/{characterId}` (Mestre aprova ficha)
- **FR-BACK-06**: Endpoints REST de Anotações, Grimório e Bestiário:
  - CRUD para notas de sessão e fichas de monstros/NPCs.

### Frontend (React + TypeScript)
- **FR-FRONT-01**: Integração do serviço de API no frontend React para substituir os dados mockados (`mockData.ts`) por chamadas HTTP ativas.
- **FR-FRONT-02**: Gerenciamento de Sessão/Auth com persistência de token (JWT/Supabase).
- **FR-FRONT-03**: Sincronização em tempo real / otimista da edição de fichas, atributos, aprimoramentos, perícias e pontos vitais.
- **FR-FRONT-04**: Interface do Mestre (Dashboard da Campanha) para visualizar as fichas da mesa e aprovar edições pendentes (`isPendingDMReview`).

---

## Requisitos Não-Funcionais (NFR)

- **NFR-01 (Arquitetura)**: Separação clara em camadas (Controller -> Service -> Repository -> Entity/DTO).
- **NFR-02 (Extensibilidade)**: Estrutura da ficha flexível (suporte a atributos genéricos JSONB/EAV para no futuro acoplar novos sistemas de RPG além do Daemon).
- **NFR-03 (Performance)**: Resposta dos endpoints REST em < 200ms sob uso normal.
- **NFR-04 (Usabilidade & UX)**: Interface responsiva e fluida com visual moderno já presente no frontend React.
