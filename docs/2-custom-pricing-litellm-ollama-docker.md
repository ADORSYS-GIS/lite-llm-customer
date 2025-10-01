# LiteLLM Custom Pricing with Ollama and Docker Compose

## 📊 Custom Pricing Configuration

LiteLLM allows you to define custom pricing models for your Ollama models. Here's how to set it up:

### Model Configuration

In your `litellm-config.yaml`, you can define multiple models with their respective endpoints and pricing:

```yaml
model_list:
  - model_name: "llama3.2"
    litellm_params:
      model: "ollama_chat/llama3.2"
      api_base: "http://ollama:11434"
    model_info:
      input_cost_per_token: 0.00002    # $0.00002 per input token
      output_cost_per_token: 0.00004   # $0.00004 per output token
      input_cost_per_second: 0.001     # $0.001 per second of processing input
      output_cost_per_second: 0.002    # $0.002 per second of processing output
      cache_creation_input_token_cost: 0.00001
      cache_read_input_token_cost: 0.000005

  # Add more models as needed
  - model_name: "codellama"
    litellm_params:
      model: "ollama_chat/codellama"
      api_base: "http://ollama:11434"
    model_info:
      input_cost_per_token: 0.00003
      output_cost_per_token: 0.00006

  - model_name: "mistral"
    litellm_params:
      model: "ollama_chat/mistral"
      api_base: "http://ollama:11434"
    model_info:
      input_cost_per_token: 0.000025
      output_cost_per_token: 0.00005

general_settings:
  master_key: sk-1234
  database_url: postgres://litellm:secret@db:5432/litellm
```

### Restart the LiteLLM service:

```bash
docker compose restart litellm
```

## 💰 Setting Up Budgets
If you have not created a budget yet you can use the [LiteLLM + Ollama Docker Setup Guide](./1-litellm-ollama-docker-guide.md) . As well as assigning a customer to a budget.

## 📈 Usage Tracking

### Make a request to a model

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "llama3.2",
    "messages": [
      {
        "role": "user",
        "content": "Tell me a short joke"
      }
    ],
    "user": "<end_user_id>"
  }'
```


## Check Customer Spending
```bash
# Get usage for a specific customer
curl -X GET 'http://localhost:4000/customer/info?end_user_id=<end_user_id>' \
-H 'Authorization: Bearer sk-1234' | jq
```
### Update budget

```bash
curl -X POST "http://localhost:4000/budget/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "budget_id": "<budget_id>",
    "max_budget": <new_amount>,
    }'
```

### Assign/ Change budget for an existing customer

```bash
curl -X POST "http://localhost:4000/customer/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "user_id": "<end_user_id>",
    "budget_id": "<budget_id>"
  }'
```




## 🛠️ Troubleshooting

If you encounter issues:

1. Check LiteLLM logs: `docker compose logs litellm`
2. Verify model availability: `curl http://localhost:11434/api/tags`
3. Test pricing updates with a small budget first

## 📚 Additional Resources

- [LiteLLM + Ollama Docker Setup Guide](./1-litellm-ollama-docker-guide.md)
- [LiteLLM Documentation](https://docs.litellm.ai/docs/proxy/custom_pricing)
