# Guia de Execução Local e Deployment — Chronicles RPG

Este documento detalha todos os passos necessários para configurar o ambiente de desenvolvimento local, executar os testes, construir imagens de container Docker multi-stage e realizar o deploy da aplicação Chronicles em produção.

---

## 1. Pré-requisitos

Para executar a aplicação localmente sem Docker:
- **Node.js:** Versão 20+ ou 22 LTS e **npm** (para o frontend).
- **Java JDK 21:** O projeto utiliza Java 21 LTS (`eclipse-temurin:21`).
  > **Atenção (JAVA_HOME):** O wrapper Maven (`./mvnw`) utiliza a versão do Java apontada pela variável de ambiente `JAVA_HOME`. Se a sua máquina tiver um JDK global mais recente (ex: Java 25 ou 26), verifique e aponte `JAVA_HOME` para um JDK 21 antes de compilar localmente, ou utilize os containers Docker que já fixam o Java 21.
- **Docker & Docker Compose:** Versão 24+ ou Docker Desktop atualizado.
- **Maven Global:** **Não é necessário**. O projeto possui o wrapper Maven oficial (`backend/mvnw` e `backend/mvnw.cmd`) versionado no repositório.

---

## 2. Execução Local para Desenvolvimento (Dev Stack)

### Passo 1: Clonar o Repositório e Configurar Variáveis
```bash
git clone https://github.com/theduts/chronicles.git
cd chronicles
cp .env.example .env  # se aplicável, ajuste credenciais caso necessário
```

### Passo 2: Iniciar Banco de Dados e Storage Local (Dev Compose)
O projeto disponibiliza um Docker Compose exclusivo para desenvolvimento que inicia o PostgreSQL 16 na porta host **4321** (evitando conflito com instalações na porta padrão 5432) e o MinIO (S3 compatível) nas portas 9000 e 9001:
```bash
docker compose -f docker/docker-compose.yml up -d
```

### Passo 3: Iniciar o Backend Spring Boot
No diretório `backend/`:
```bash
cd backend
# No Linux/macOS:
./mvnw spring-boot:run
# No Windows PowerShell:
.\mvnw spring-boot:run
```
- **Migrações de Banco:** O Flyway aplica todas as migrações SQL (`db/migration/V1__...` até `V5__...`) automaticamente na inicialização. Não há comando manual de migração.
- **Swagger / OpenAPI:** Disponível em `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema JSON:** Disponível em `http://localhost:8080/v3/api-docs`

### Passo 4: Iniciar o Frontend React (Vite)
Em outro terminal, no diretório `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
- O servidor de desenvolvimento do Vite inicia na porta **4000** (`http://localhost:4000`), configurada no `vite.config.ts`.
- O backend já possui permissão de CORS configurada para `http://localhost:4000` por padrão.

---

## 3. Variáveis de Ambiente

| Variável | Obrigatória em Prod? | Padrão Local | Descrição e Finalidade |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | Sim | `jdbc:postgresql://localhost:4321/chronicles` | URL JDBC de conexão com o PostgreSQL (em prod, apontar para o Supabase). |
| `SPRING_DATASOURCE_USERNAME` | Sim | `postgres` | Usuário do banco de dados PostgreSQL. |
| `SPRING_DATASOURCE_PASSWORD` | Sim | `postgres` | Senha do banco de dados PostgreSQL. |
| `JWT_SECRET_KEY` | **SIM (CRÍTICA)** | *(Chave pública no repositório)* | **Chave HMAC-SHA de 256+ bits para assinatura dos tokens JWT. Em produção, NUNCA utilize o valor default commitado.** |
| `JWT_EXPIRATION_MS` | Não | `86400000` (24 horas) | Tempo de vida dos tokens de autenticação em milissegundos. |
| `CORS_ALLOWED_ORIGINS` | Sim | `http://localhost:3000,http://localhost:4000,http://localhost:5173` | Lista separada por vírgulas das URLs autorizadas a consumir a API. |
| `MINIO_ENDPOINT` | Não | `http://localhost:9000` | Endpoint da API S3 / MinIO para upload de imagens de fichas e avatares. |
| `MINIO_ACCESS_KEY` | Sim | `minioadmin` | Access Key do MinIO / bucket S3. |
| `MINIO_SECRET_KEY` | Sim | `minioadmin` | Secret Key do MinIO / bucket S3. |
| `MINIO_BUCKET_NAME` | Não | `chronicles-media` | Nome do bucket para armazenamento de mídias. |
| `VITE_API_URL` | Sim (no build) | `http://localhost:8080` | URL base do backend. **Bakeada no build do frontend** pelo Vite. |

---

## 4. Construção e Execução de Imagens Docker (Produção / UAT)

As imagens do backend e frontend são totalmente independentes e construídas a partir de seus próprios contextos.

### 4.1. Imagem do Backend (Spring Boot 3 / Java 21)
Construção multi-stage (`eclipse-temurin:21-jdk-alpine` -> `eclipse-temurin:21-jre-alpine` com usuário non-root `spring`):
```bash
docker build -t chronicles-backend:uat ./backend
```
Execução do container backend:
```bash
docker run -d \
  --name chronicles-backend \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://host.docker.internal:4321/chronicles" \
  -e SPRING_DATASOURCE_USERNAME="postgres" \
  -e SPRING_DATASOURCE_PASSWORD="postgres" \
  -e JWT_SECRET_KEY="SUA_CHAVE_SECRETA_MUITO_SEGURA_COM_PELO_MENOS_256_BITS" \
  -e CORS_ALLOWED_ORIGINS="http://localhost:80,http://localhost:4000" \
  chronicles-backend:uat
```

### 4.2. Imagem do Frontend (Vite + Nginx)
Construção multi-stage (`node:22-alpine` -> `nginx:1.27-alpine` com fallback SPA `try_files`):
> **Importante:** O Vite embute o valor de `VITE_API_URL` estaticamente no bundle JavaScript durante o comando `npm run build`. Portanto, passar essa variável em tempo de execução (`docker run -e`) não tem efeito. Se a URL da API mudar, o container deve ser rebuildado passando `--build-arg`:

```bash
docker build \
  --build-arg VITE_API_URL="http://localhost:8080" \
  -t chronicles-frontend:uat \
  ./frontend
```
Execução do container frontend:
```bash
docker run -d \
  --name chronicles-frontend \
  -p 80:80 \
  chronicles-frontend:uat
```

---

## 5. Topologia de Produção

- **Containers de Aplicação:** Apenas `chronicles-backend` e `chronicles-frontend` rodam em containers de produção.
- **Banco de Dados Gerenciado:** Em produção, **não há container de banco de dados**. O backend conecta-se diretamente a uma instância gerenciada de PostgreSQL no **Supabase** via `SPRING_DATASOURCE_URL`.
- **Armazenamento de Arquivos:** Pode utilizar o Supabase Storage ou serviço compatível com AWS S3.
- **Dev-Only Compose:** O arquivo `docker/docker-compose.yml` destina-se exclusivamente ao desenvolvimento local.

---

## 6. Considerações de Arquitetura e Segurança

- **Nginx Master vs. Worker Privileges:** A imagem `nginx:alpine` inicia o processo master como root para realizar o bind na porta 80 e, em seguida, executa os processos workers (que atendem requisições HTTP) com privilégios reduzidos. Essa abordagem padrão é segura e dispensa configurações intrusivas de capabilities.
- **Encaminhamento de IP (Forwarded Headers):** O backend possui `server.forward-headers-strategy: framework` habilitado no `application.yml`. Isso garante que, ao rodar atrás de um Load Balancer, Ingress ou Reverse Proxy (como Nginx, Cloudflare ou AWS ALB), a aplicação extraia o IP real do cliente via cabeçalho `X-Forwarded-For`. Isso é essencial para que a proteção contra força bruta por IP composto (D-03) opere corretamente em produção.
