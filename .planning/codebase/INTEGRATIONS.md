# Integrações e Fontes de Dados

## Persistência Atual (Client-Side Mock)
Atualmente o frontend utiliza `localStorage` para persistência local durante o desenvolvimento:
- `daemon_user`: Dados de autenticação e sessão (`{ name, email, role: 'player' | 'dm' }`).
- `chronicles_characters`: Lista de fichas de personagem serializadas em JSON.
- `chronicles_campaigns`: Lista de campanhas ativas e jogadores.
- `chronicles_notes`: Diário de sessão e anotações.

## Integrações Externas Atuais
- **Google Gemini AI Studio API:**
  - Biblioteca: `@google/genai`
  - Variável de ambiente: `GEMINI_API_KEY` em `.env.local`
  - Utilizado para prototipação de descrições e assistente de lore/regras.

## Próxima Integração (Backend Spring Boot + Supabase)
- **API Target:** Endpoints RESTful em Java + Spring Boot (Host local: `http://localhost:8080/api`).
- **Banco de Dados Alvo:** Supabase PostgreSQL via JDBC / Spring Data JPA.
- **Formato de Dados:** JSON REST DTOs mapeados a partir dos tipos existentes em `types.ts`.
