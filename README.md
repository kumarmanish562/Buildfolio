# BuildFolio

> AI-powered code intelligence for your GitHub repositories.

BuildFolio is a full-stack AI developer platform that connects with GitHub, indexes repository source code, stores semantic embeddings in PostgreSQL with PGVector, and lets developers ask natural-language questions about their codebase.

Instead of manually searching through hundreds of files, developers can use BuildFolio to understand architecture, APIs, authentication, database logic, dependencies, and implementation details through an AI-powered chat interface.

---

## ✨ Features

- 🔐 **GitHub OAuth Authentication**
- 📦 **GitHub Repository Synchronization**
- 🔎 **Repository Search & Filtering**
- 🧠 **AI-powered Code Intelligence**
- 📚 **RAG-based Code Understanding**
- ✂️ **Automatic Source Code Chunking**
- 🔢 **Vector Embeddings**
- 🐘 **PostgreSQL + PGVector**
- 💬 **Repository-based AI Chat**
- ⚡ **Streaming AI Responses**
- 📌 **Code Citations**
- 📊 **Repository Indexing Statistics**
- 🌙 **Dark / Light Theme**
- 📱 **Responsive Developer Dashboard**
- 🩺 **Backend System Health Monitoring**

---

## 🧠 How BuildFolio Works

BuildFolio converts a GitHub repository into an intelligent knowledge base.

```text
GitHub Repository
       │
       ▼
Repository Synchronization
       │
       ▼
Source Code Processing
       │
       ▼
File Chunking
       │
       ▼
Embedding Generation
       │
       ▼
PostgreSQL + PGVector
       │
       ▼
Semantic Vector Search
       │
       ▼
Relevant Code Retrieval
       │
       ▼
RAG Pipeline
       │
       ▼
AI Model
       │
       ▼
Grounded Answer

Developers can ask questions such as:

How does authentication work?

Where is GitHub OAuth implemented?

Explain the repository architecture.

Where is JWT validation handled?

How does repository indexing work?

Which class handles database connections?

Where is the API for creating chat sessions?

What happens when indexing starts?

🏗️ Architecture

                         ┌───────────────────┐
                         │      GitHub       │
                         │   OAuth + Repos   │
                         └─────────┬─────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────┐
│                    Next.js Frontend                  │
│                                                      │
│  Landing Page                                        │
│  Authentication                                      │
│  Dashboard                                           │
│  Repository Management                               │
│  AI Chat                                             │
│  Settings                                            │
│                                                      │
└─────────────────────────┬────────────────────────────┘
                          │
                    REST API / SSE
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                  Spring Boot Backend                 │
│                                                      │
│  GitHub OAuth                                        │
│  Authentication                                      │
│  Repository Services                                 │
│  Repository Indexing                                 │
│  Chat Sessions                                       │
│  RAG Orchestration                                   │
│  AI Integration                                      │
│                                                      │
└───────────────┬───────────────────────┬──────────────┘
                │                       │
                ▼                       ▼
      ┌─────────────────┐      ┌──────────────────┐
      │   PostgreSQL    │      │    AI Services   │
      │                 │      │                  │
      │ Users           │      │ Embeddings       │
      │ Repositories    │      │ LLM              │
      │ Chat Sessions   │      │ RAG              │
      │ Chat Messages   │      │                  │
      └────────┬────────┘      └──────────────────┘
               │
               ▼
      ┌─────────────────┐
      │     PGVector    │
      │                 │
      │ Vector Storage  │
      │ Similarity      │
      │ Search          │
      └─────────────────┘

🚀 Application Workflow

                    User
                     │
                     ▼
              BuildFolio Landing
                     │
                     ▼
                GitHub Login
                     │
                     ▼
              GitHub OAuth
                     │
                     ▼
                 Dashboard
                     │
                     ▼
             Repository Sync
                     │
                     ▼
              Repository List
                     │
                     ▼
            Start Repository Index
                     │
                     ▼
             Fetch Source Files
                     │
                     ▼
              Code Chunking
                     │
                     ▼
            Generate Embeddings
                     │
                     ▼
                 PGVector
                     │
                     ▼
             Repository READY
                     │
                     ▼
                  AI Chat
                     │
                     ▼
              User Question
                     │
                     ▼
             Semantic Retrieval
                     │
                     ▼
             Relevant Code Chunks
                     │
                     ▼
                RAG Context
                     │
                     ▼
                 AI Model
                     │
                     ▼
             Streaming Response
                     │
                     ▼
               Code Citations

🔐 GitHub OAuth

BuildFolio uses GitHub OAuth to authenticate developers.

The authentication flow is:

User
 │
 ▼
BuildFolio
 │
 ▼
GitHub OAuth
 │
 ▼
GitHub Authorization
 │
 ▼
OAuth Callback
 │
 ▼
Spring Security
 │
 ▼
User Account
 │
 ▼
BuildFolio Dashboard

The application can access repositories according to the permissions granted through GitHub OAuth.
📦 Repository Management

BuildFolio synchronizes repositories from the connected GitHub account.

Repository information includes:

    Repository name

    Repository owner

    Full repository name

    Visibility

    Default branch

    Programming language

    Description

    GitHub URL

    Indexing status

    File count

    Processed files

    Chunk count

    Indexing timestamp

    Error information

Example:

Repository
├── Owner
├── Name
├── Language
├── Visibility
├── Default Branch
├── Files
├── Processed Files
├── Chunks
└── Index Status

🔎 Repository Indexing

BuildFolio processes repository source code and converts it into searchable knowledge.

Repository
     │
     ▼
Fetch Files
     │
     ▼
Filter Files
     │
     ▼
Read Source Code
     │
     ▼
Split Into Chunks
     │
     ▼
Generate Embeddings
     │
     ▼
Store in PGVector
     │
     ▼
Index Complete

The indexing system tracks:

Files Total
Files Processed
Chunk Count
Index Status
Indexed At
Error Message

📊 Indexing Status

Repositories follow an indexing lifecycle:

PENDING
   │
   ▼
INDEXING
   │
   ├──────────────► FAILED
   │
   ▼
READY

PENDING

The repository is connected but indexing has not started.
INDEXING

Repository files are currently being processed.
READY

The repository has been successfully indexed and is ready for AI chat.
FAILED

An error occurred during indexing.
🧠 Retrieval-Augmented Generation

BuildFolio uses RAG to provide answers based on actual repository code.

Instead of sending the complete repository to the AI model, relevant code is retrieved first.

Question
   │
   ▼
Embedding
   │
   ▼
Vector Search
   │
   ▼
Top Relevant Chunks
   │
   ▼
Context
   │
   ▼
AI Model
   │
   ▼
Answer

This improves the ability of the system to answer repository-specific questions while reducing unnecessary context.
💬 AI Chat

Each repository can have multiple chat sessions.

Repository
     │
     ├── Chat Session 1
     │      ├── User Message
     │      ├── AI Message
     │      └── Citations
     │
     ├── Chat Session 2
     │      ├── User Message
     │      ├── AI Message
     │      └── Citations
     │
     └── Chat Session 3
            ├── User Message
            ├── AI Message
            └── Citations

Chat sessions contain:

    Session title

    Repository

    User

    Messages

    Creation timestamp

⚡ Streaming Responses

BuildFolio supports streaming AI responses using Server-Sent Events (SSE).

Instead of waiting for the complete answer, the frontend can receive the response progressively.

User Question
      │
      ▼
Backend
      │
      ▼
RAG Retrieval
      │
      ▼
AI Model
      │
      ▼
Token Stream
      │
      ▼
Next.js Chat UI

This provides a faster and more interactive chat experience.
📚 Code Citations

AI responses can reference the source code used to generate the answer.

Example:

SecurityConfig.java
Lines 42 - 86

Citations help developers verify AI-generated explanations against their actual source code.
🖥️ Dashboard

BuildFolio provides a developer-focused dashboard.
Overview

The dashboard can provide information such as:

Repositories
Ready Repositories
Indexing Repositories
Indexed Chunks
Recent Activity

Repositories

Developers can:

    Search repositories

    Filter repositories

    View repository information

    Start indexing

    Monitor indexing

    Open repository details

    Chat with indexed repositories

Settings

Settings include:

    GitHub account information

    User profile

    GitHub username

    Authentication status

    Theme settings

    Backend health

    Logout

🛠️ Tech Stack
Frontend

    Next.js

    React

    TypeScript

    Tailwind CSS

    React Query

    Framer Motion

    Lucide React

    Server-Sent Events

Backend

    Java

    Spring Boot

    Spring Security

    Spring OAuth2 Client

    Spring Data JPA

    Spring AI

    REST APIs

    Server-Sent Events

Database

    PostgreSQL

    PGVector

    Flyway

AI

    OpenAI

    OpenAI Embeddings

    Retrieval-Augmented Generation

    Vector Similarity Search

Authentication

    GitHub OAuth 2.0

    Spring Security

Development

    Docker

    Docker Compose

    Maven

    npm

    Git

    GitHub

🗄️ Database Structure

BuildFolio uses PostgreSQL as its primary relational database.

Main tables include:

users
repositories
chat_sessions
chat_messages
vector_store

Users

users
├── id
├── github_id
├── github_username
├── display_name
├── avatar_url
├── access_token
├── token_scopes
└── created_at

Repositories

repositories
├── id
├── user_id
├── github_repo_id
├── owner
├── name
├── full_name
├── is_private
├── default_branch
├── language
├── html_url
├── description
├── index_status
├── indexed_at
├── chunk_count
├── files_total
├── files_processed
├── error_message
├── created_at
└── updated_at

Chat Sessions

chat_sessions
├── id
├── user_id
├── repository_id
├── title
└── created_at

Chat Messages

chat_messages
├── id
├── session_id
├── role
├── content
├── citations
└── created_at

🐘 PostgreSQL + PGVector

BuildFolio uses PostgreSQL with the PGVector extension for semantic search.

The local Docker setup uses:

Image:
pgvector/pgvector:pg16

Database:
buildfolio

Host:
localhost

Port:
5433

Check the PostgreSQL container:

docker ps

Example:

buildfolio-postgres
0.0.0.0:5433 -> 5432

🐳 Docker PostgreSQL

Example:

docker run -d \
  --name buildfolio-postgres \
  -p 5433:5432 \
  -e POSTGRES_DB=buildfolio \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  pgvector/pgvector:pg16

Start the container:

docker start buildfolio-postgres

Stop the container:

docker stop buildfolio-postgres

⚙️ Backend Configuration

The backend uses environment variables for sensitive configuration.

Example PowerShell configuration:

$env:DB_PASSWORD="your-postgres-password"

$env:GITHUB_CLIENT_ID="your-github-client-id"

$env:GITHUB_CLIENT_SECRET="your-github-client-secret"

$env:OPENAI_API_KEY="your-openai-api-key"

$env:TOKEN_ENCRYPTOR_PASSWORD="your-strong-encryption-password"

$env:TOKEN_ENCRYPTOR_SALT="your-strong-encryption-salt"

Never commit real credentials to GitHub.
🔑 GitHub OAuth Configuration

Create a GitHub OAuth application and configure:

Homepage URL

http://localhost:3000

Callback URL:

http://localhost:8080/login/oauth2/code/github

Example configuration:

spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}

spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}

spring.security.oauth2.client.registration.github.scope=read:user,user:email,repo

📝 Application Properties

Example:

spring.application.name=buildfolio-backend

server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5433/buildfolio
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

app.cors.allowed-origins=http://localhost:3000
app.frontend-url=http://localhost:3000

app.token-encryptor-password=${TOKEN_ENCRYPTOR_PASSWORD}
app.token-encryptor-salt=${TOKEN_ENCRYPTOR_SALT}

spring.ai.vectorstore.pgvector.initialize-schema=true
spring.ai.vectorstore.pgvector.table-name=vector_store
spring.ai.vectorstore.pgvector.schema-name=public

▶️ Getting Started
1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/buildfolio.git

cd buildfolio

2. Start PostgreSQL

Make sure Docker is running.

docker ps

If the container already exists:

docker start buildfolio-postgres

3. Configure Environment Variables

PowerShell:

$env:DB_PASSWORD="your-postgres-password"
$env:GITHUB_CLIENT_ID="your-github-client-id"
$env:GITHUB_CLIENT_SECRET="your-github-client-secret"
$env:OPENAI_API_KEY="your-openai-api-key"
$env:TOKEN_ENCRYPTOR_PASSWORD="your-encryption-password"
$env:TOKEN_ENCRYPTOR_SALT="your-encryption-salt"

4. Start the Backend

Open a terminal:

cd backend

Run:

.\mvnw.cmd spring-boot:run

Backend:

http://localhost:8080

5. Start the Frontend

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend:

http://localhost:3000

📁 Project Structure

buildfolio/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── buildfolio/
│   │       │
│   │       └── resources/
│   │           ├── db/
│   │           │   └── migration/
│   │           └── application.properties
│   │
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── login/
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   ├── chat/
│   │   ├── icons/
│   │   └── ui/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── docker-compose.yml
└── README.md

🔌 API Overview
Authentication

GET /api/auth/me
POST /api/auth/logout

GitHub login:

GET /oauth2/authorization/github

Repositories

GET /api/repos
GET /api/repos/{id}
POST /api/repos/{id}/index
GET /api/repos/{id}/status

Chat Sessions

POST /api/chat/sessions
GET /api/chat/sessions?repositoryId={repositoryId}
GET /api/chat/sessions/{sessionId}

Chat

POST /api/chat/sessions/{sessionId}/messages

The chat endpoint can stream AI responses using Server-Sent Events.
🛡️ Security

BuildFolio follows secure development practices.

Security features include:

    GitHub OAuth authentication

    Protected dashboard routes

    Backend authentication checks

    Environment-based secrets

    Token encryption

    CORS configuration

    Repository access through authenticated GitHub accounts

    No hard-coded API keys

Never commit:

.env
API keys
GitHub client secrets
Database passwords
OAuth secrets
Encryption passwords

🎨 UI & UX

BuildFolio is designed as a modern developer tool.

The interface provides:

    Clean developer dashboard

    Responsive layout

    Dark and light themes

    Repository cards

    Repository filters

    Indexing status

    AI chat interface

    Code citations

    Streaming responses

    Animated landing page

    Mobile-friendly navigation

📈 Future Improvements

    Incremental repository indexing

    Background indexing jobs

    GitHub webhook integration

    Pull request analysis

    Commit analysis

    Branch comparison

    Repository file explorer

    Code dependency visualization

    AI-generated architecture diagrams

    Conversation search

    Advanced code citations

    Team workspaces

    Usage analytics

    Production deployment

    Multi-repository conversations

🚧 Development Status

BuildFolio is currently under active development.

Current capabilities include:

✅ Next.js frontend
✅ React + TypeScript
✅ Spring Boot backend
✅ GitHub OAuth
✅ PostgreSQL
✅ PGVector
✅ Flyway
✅ Repository synchronization
✅ Repository indexing
✅ Code chunking
✅ Vector search
✅ RAG architecture
✅ Chat sessions
✅ AI code Q&A
✅ Streaming responses
✅ Code citations
✅ Dark / Light theme
✅ Backend health monitoring

🤝 Contributing

Contributions are welcome.
1. Fork the repository
2. Create a feature branch

git checkout -b feature/your-feature

3. Commit your changes

git add .
git commit -m "feat: add your feature"

4. Push your branch

git push origin feature/your-feature

5. Create a Pull Request
📜 License

This project is currently intended for educational and portfolio purposes.

Add an appropriate open-source license before distributing the project publicly.
👨‍💻 Author
Manish Kumar

Computer Science Engineering Student
Full-Stack Developer | AI/ML Enthusiast
Interests

Java
Spring Boot
React
Next.js
AI/ML
RAG
PostgreSQL
Cloud
DevOps

⭐ Why BuildFolio?

Understanding a large or unfamiliar codebase can take significant time.

BuildFolio combines GitHub, code indexing, vector search, RAG, and AI to create an intelligent development workspace.

GitHub
   +
Code Indexing
   +
Embeddings
   +
Vector Search
   +
RAG
   +
AI
   =
Code Intelligence
