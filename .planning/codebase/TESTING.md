# Testes e Qualidade de Código

## Estado Atual de Testes no Frontend
- **Checagem de Tipos Estática:** Executada via `npm run lint` (`tsc --noEmit`).
- **Testes Unitários/E2E:** Atualmente não há framework de testes automatizados (como Vitest ou Jest) configurado no repositório frontend.

## Estratégia de Testes Recomendada para o Projeto Full-Stack

### Backend (Spring Boot 3.x)
- **Testes Unitários:** JUnit 5 + Mockito para testar Services e validações de regras de negócios do sistema Daemon (cálculo de atributos, pontos de vida e magias).
- **Testes de Integração:** `@SpringBootTest` + `@AutoConfigureMockMvc` para testar os endpoints REST da API e persistência via Spring Data JPA.

### Frontend (React + TypeScript)
- Configuração do **Vitest** + **React Testing Library** para testar a renderização de componentes de ficha e formulários.
- Testes E2E (Playwright / Cypress) para fluxos críticos de usuário (Login, Criação de Ficha e Aprovação do Mestre).
