# LiteLLM + Ollama Docker Setup Guide

This guide shows you how to set up LiteLLM as a proxy for Ollama models using Docker Compose, test the setup, and integrate it with your applications.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Your App      │───▶│   LiteLLM    │───▶│     Ollama      │
│  (port 3000)    │    │  (port 4000) │    │  (port 11434)   │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  PostgreSQL  │
                       │  (port 5432) │
                       └──────────────┘
```

**Benefits of this setup:**

- **Unified API**: Use OpenAI-compatible endpoints for any model
- **Model Management**: Easy switching between different Ollama models
- **Monitoring**: Built-in usage tracking and logging
- **Security**: API key management and rate limiting

---

## 📁 Required Files

Create these files in your project directory:

### 1. `docker-compose.yml`

```yaml
version: "3.8"

services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    # Optional: Enable GPU support
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

  db:
    image: postgres:15
    container_name: litellm-db
    restart: always
    environment:
      POSTGRES_USER: litellm
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: litellm
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: litellm
    depends_on:
      - db
      - ollama
    ports:
      - "4000:4000"
    volumes:
      - ./litellm_config.yaml:/app/config.yaml:ro
    environment:
      LITELLM_MASTER_KEY: sk-1234
      LITELLM_SALT_KEY: this-is-a-random-salt
      DATABASE_URL: postgres://litellm:secret@db:5432/litellm
    command: ["--config", "/app/config.yaml"]

volumes:
  ollama:
  pgdata:
```

### 2. `litellm_config.yaml`

```yaml
model_list:
  - model_name: "llama3.2"
    litellm_params:
      model: "ollama_chat/llama3.2"
      api_base: "http://ollama:11434"

  # Add more models as needed
  - model_name: "codellama"
    litellm_params:
      model: "ollama_chat/codellama"
      api_base: "http://ollama:11434"

  - model_name: "mistral"
    litellm_params:
      model: "ollama_chat/mistral"
      api_base: "http://ollama:11434"

general_settings:
  master_key: sk-1234
  database_url: postgres://litellm:secret@db:5432/litellm
```

---

## 🚀 Setup Instructions

### Step 1: Start the Services

```bash
# Start all services
docker compose up -d

# Check if services are running
docker compose ps

# View logs
docker compose logs litellm
docker compose logs ollama
```

### Step 2: Pull Ollama Models

```bash
# Pull the llama3.2 model
docker exec -it ollama ollama pull llama3.2

# Pull additional models (optional)
docker exec -it ollama ollama pull codellama
docker exec -it ollama ollama pull mistral

# List available models
docker exec -it ollama ollama list
```

### Step 3: Verify Setup

```bash
# Check Ollama is working
curl http://localhost:11434/api/tags

# Check LiteLLM is working
curl http://localhost:4000/health

# Check LiteLLM models
curl http://localhost:4000/models \
  -H "Authorization: Bearer sk-1234"
```

---

## 🧪 Testing the Setup

### Test 1: Direct Ollama Test

```bash
# Test Ollama directly
curl http://localhost:11434/api/generate \
  -d '{
    "model": "llama3.2",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

### Test 2: LiteLLM OpenAI-Compatible API

```bash
# Test chat completions endpoint
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "llama3.2",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "temperature": 0.7
  }'
```

# Test3: litellm endpoints testing

```bash
# create a budget
curl -X POST http://localhost:4000/budget/new \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "budget_id":"my-free-tier",
    "max_budget": 1000,
    "currency": "USD",
    "reset_interval": "monthly"
  }'
```

```bash
# Create/ assign a customer to a budget
curl -X POST http://localhost:4000/customer/new \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "user_id":"customer-123",
    "budget_id":"my-free-tier"
  }'

```

```bash
# list customers
curl -X GET http://localhost:4000/customer/list \
  -H "Authorization: Bearer sk-1234"
```

```bash
# list budgets
curl -X GET http://localhost:4000/budget/list \
  -H "Authorization: Bearer sk-1234"
```

## 🔍 Monitoring & Management

### LiteLLM Admin UI

Access the admin interface at: `http://localhost:4000`

**Features:**

- View usage statistics
- Manage API keys
- Monitor model performance
- Set rate limits and budgets

### Health Checks

```bash
# Check overall health
curl http://localhost:4000/health

# Check specific model
curl http://localhost:4000/model/info/llama3.2 \
  -H "Authorization: Bearer sk-1234"

# View usage stats
curl http://localhost:4000/global/spend \
  -H "Authorization: Bearer sk-1234"
```

### Log Monitoring

```bash
# Follow logs in real-time
docker compose logs -f litellm

# Check Ollama logs
docker compose logs -f ollama

# Check database logs
docker compose logs -f db
```

---

## 🛠️ Troubleshooting

### Common Issues

**1. Models not loading**

```bash
# Check if model is pulled
docker exec -it ollama ollama list

# Pull model if missing
docker exec -it ollama ollama pull llama3.2
```

**2. LiteLLM can't connect to Ollama**

```bash
# Check network connectivity
docker exec -it litellm curl http://ollama:11434/api/tags

# Restart services
docker compose restart litellm
```

**3. Database connection issues**

```bash
# Check database
docker exec -it litellm-db psql -U litellm -d litellm -c "\dt"

# Reset database
docker compose down -v
docker compose up -d
```

**4. Port conflicts**

```bash
# Check what's using ports
lsof -i :4000
lsof -i :11434
lsof -i :5432

# Change ports in docker-compose.yml if needed
```

### Backup & Recovery

```bash
# Backup database
docker exec litellm-db pg_dump -U litellm litellm > backup.sql

# Backup Ollama models
docker cp ollama:/root/.ollama ./ollama-backup/

# Restore
docker cp ./ollama-backup/ ollama:/root/.ollama
docker exec -i litellm-db psql -U litellm litellm < backup.sql
```

---

## 📚 Additional Resources

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Ollama Documentation](https://ollama.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## 🎯 Quick Commands Reference

```bash
# Start services
docker compose up -d

# Pull model
docker exec -it ollama ollama pull llama3.2

# Test endpoint
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2","messages":[{"role":"user","content":"Hello!"}]}'

# View logs
docker compose logs -f litellm

# Stop services
docker compose down

# Reset everything
docker compose down -v && docker compose up -d
```

This setup gives you a production-ready LiteLLM + Ollama environment that's compatible with OpenAI's API format!
