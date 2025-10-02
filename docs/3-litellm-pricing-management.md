# LiteLLM Pricing Management - Complete Documentation



## Overview

LiteLLM acts as a unified proxy/gateway that sits between your application and various LLM providers (Ollama, OpenAI, Azure, Anthropic, etc.). It handles request routing, cost calculation, and spend tracking independently of the model providers.

### Key Concept 
**LiteLLM calculates costs, not the providers.** The providers only process requests and return token usage - LiteLLM does the pricing math.

---

## Architecture & Flow

### High-Level Request Flow

```
┌─────────────┐
│   Your App  │
└──────┬──────┘
       │ 1. Request with API Key
       ▼
┌─────────────────────────────────────────┐
│        LiteLLM Proxy Server             │
│  ┌───────────────────────────────────┐  │
│  │  2. Validate & Route Request      │  │
│  └───────────────┬───────────────────┘  │
│                  ▼                       │
│  ┌───────────────────────────────────┐  │
│  │  3. Check Pricing Configuration   │  │
│  │     - Custom pricing?             │  │
│  │     - Built-in cost map?          │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼──────────────────────┘
                   │ 4. Forward to Provider
                   ▼
        ┌──────────────────────┐
        │  Model Provider      │
        │  (OpenAI, Azure,     │
        │   Anthropic, etc.)   │
        └──────────┬───────────┘
                   │ 5. Response with token counts
                   ▼
┌─────────────────────────────────────────┐
│        LiteLLM Proxy Server             │
│  ┌───────────────────────────────────┐  │
│  │  6. Calculate Cost                │  │
│  │     cost = (input_tokens *        │  │
│  │            input_price) +         │  │
│  │           (output_tokens *        │  │
│  │            output_price)          │  │
│  └───────────────┬───────────────────┘  │
│                  ▼                       │
│  ┌───────────────────────────────────┐  │
│  │  7. Log to Database               │  │
│  │     - LiteLLM_SpendLogs table     │  │
│  │     - Update user/team/key spend  │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼──────────────────────┘
                   │ 8. Return response + cost header
                   ▼
            ┌─────────────┐
            │   Your App  │
            └─────────────┘
```

---

## Pricing Management Mechanisms

### 1. Cost Tracking Methods

LiteLLM supports two primary cost tracking methods:

#### A. Cost Per Token (Most Common)
Used by: OpenAI, Anthropic, Azure OpenAI, most text models

```yaml
model_list:
  - model_name: my-gpt4-model
    litellm_params:
      model: azure/gpt-4
      api_key: os.environ/AZURE_API_KEY
    model_info:
      input_cost_per_token: 0.00003    # $0.03 per 1K input tokens
      output_cost_per_token: 0.00006   # $0.06 per 1K output tokens
```

**Calculation:**
```
Total Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
Example: (1000 × 0.00003) + (500 × 0.00006) = $0.03 + $0.03 = $0.06
```

#### B. Cost Per Second
Used by: SageMaker endpoints, self-hosted models with dedicated compute

```yaml
model_list:
  - model_name: sagemaker-model
    litellm_params:
      model: sagemaker/my-endpoint
    model_info:
      input_cost_per_second: 0.000420  # Cost per second of compute
```

**Calculation:**
```
Total Cost = Request Duration (seconds) × Cost Per Second
Example: 5 seconds × 0.000420 = $0.0021
```

---

### 2. Pricing Resolution Flow

```
Request comes in
       │
       ▼
Does model config have custom pricing?
       │
   ┌───┴───┐
   │  YES  │  NO
   ▼       ▼
Use        Check LiteLLM's built-in
Custom     model_prices_and_context_window.json
Pricing    │
   │       ▼
   │    Found in cost map?
   │       │
   │   ┌───┴───┐
   │   │  YES  │  NO
   │   ▼       ▼
   │  Use      Log warning,
   │  Built-in estimate or
   │  Pricing  skip tracking
   │   │       │
   └───┴───────┴──► Calculate and Log Cost
```

---

## Built-in vs Custom Pricing

### Built-in Pricing (Default)

LiteLLM maintains a comprehensive cost map at:
`https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json`



**What's Included:**
- OpenAI models (GPT-3.5, GPT-4, GPT-4 Turbo, etc.)
- Anthropic models (Claude 3 family)
- Google models (Gemini)
- Azure OpenAI (mirrors OpenAI pricing)
- Cohere, AI21, Replicate
- Open source models on common platforms

**Example Entry:**
```json
{
  "gpt-4-turbo": {
    "max_tokens": 128000,
    "input_cost_per_token": 0.00001,
    "output_cost_per_token": 0.00003,
    "litellm_provider": "openai",
    "mode": "chat"
  }
}
```

### When Built-in Pricing Works Automatically

```
┌────────────────────────────────────────┐
│  Simple Config (No Custom Pricing)    │
└────────────────────────────────────────┘

model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: sk-...

    ↓ LiteLLM automatically knows pricing

Response cost calculated using built-in rates:
  - Input: $0.03 per 1K tokens
  - Output: $0.06 per 1K tokens
```

---

### Custom Pricing Scenarios

#### Scenario 1: Ollama model or Custom Model (Not in Cost Map)

**Use Case:** You're using a fine-tuned model, custom deployment, or provider (ollama) not in LiteLLM's cost map.

```yaml
model_list:
  - model_name: "llama3.2"
    litellm_params:
      model: "ollama_chat/llama3.2"
      api_base: "http://ollama:11434"
    model_info:
      input_cost_per_token: 0.00002    # $0.00002 per input token
      output_cost_per_token: 0.00004   # $0.00004 per output token
          
```

**What Happens:**
1. LiteLLM checks cost map → Not found
2. Falls back to `model_info` in config
3. Uses your custom rates for calculation

#### Scenario 2: Override Built-in Pricing

**Use Case:** You negotiated special rates, or want to track internal chargebacks differently.

```yaml
model_list:
  - model_name: prod-gpt4
    litellm_params:
      model: openai/gpt-4
      api_key: sk-...
    model_info:
      # Override default GPT-4 pricing
      input_cost_per_token: 0.00002   # Your negotiated rate
      output_cost_per_token: 0.00004  # Your negotiated rate
```

**What Happens:**
1. LiteLLM finds gpt-4 in cost map
2. Sees `model_info` override in config
3. **Uses your custom rates instead**

#### Scenario 3: Azure with Base Model

**Problem:** Azure returns generic names (e.g., "gpt-4") but you're using a specific deployment with specific pricing.

```yaml
model_list:
  - model_name: azure-gpt4-turbo
    litellm_params:
      model: azure/my-gpt4-deployment
      api_base: https://my-resource.openai.azure.com
    model_info:
      base_model: azure/gpt-4-1106-preview  # Map to correct pricing
```

**What Happens:**
1. Azure returns "gpt-4" in response
2. LiteLLM checks `base_model` config
3. Uses gpt-4-1106-preview pricing from cost map
4. Ensures accurate cost tracking

---

## Implementation Examples

### Example 1: Multi-Provider Setup with Mixed Pricing

```yaml
model_list:
  # OpenAI - uses built-in pricing
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY
  
  # Azure - needs base_model for accurate pricing
  - model_name: azure-gpt35
    litellm_params:
      model: azure/chatgpt-deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
    model_info:
      base_model: azure/gpt-3.5-turbo
  
  # Custom model - requires custom pricing
  - model_name: "codellama"
    litellm_params:
      model: "ollama_chat/codellama"
      api_base: "http://ollama:11434"
    model_info:
      input_cost_per_token: 0.00003
      output_cost_per_token: 0.00006
  
  # SageMaker - time-based pricing
  - model_name: sagemaker-model
    litellm_params:
      model: sagemaker/my-endpoint
    model_info:
      input_cost_per_second: 0.000420
```

### Example 2: Cost Tracking with Caching

For models that support prompt caching (e.g., Anthropic Claude):

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      input_cost_per_token: 0.000003
      output_cost_per_token: 0.000015
      cache_creation_input_token_cost: 0.00000375    # Cost to create cache
      cache_read_input_token_cost: 0.0000003         # Cost to read from cache
```

**Cost Calculation with Cache:**
```
Regular tokens: (1000 × 0.000003) = $0.003
Cached tokens read: (5000 × 0.0000003) = $0.0015
Output tokens: (500 × 0.000015) = $0.0075
Total: $0.012
```

---


### Cost Calculation Decision Tree

```
Request processed
       │
       ▼
Extract token counts from provider response
       │
       ▼
Check model configuration
       │
       ├─→ Has input_cost_per_token? ────┐
       │                                  │
       ├─→ Has input_cost_per_second? ───┤
       │                                  │
       └─→ Check built-in cost map ──────┤
                                          │
                                          ▼
                            ┌──────────────────────────┐
                            │  Calculate Base Cost     │
                            │                          │
                            │  Token-based:            │
                            │  (in_tok × in_price) +   │
                            │  (out_tok × out_price)   │
                            │                          │
                            │  Time-based:             │
                            │  duration × price/sec    │
                            └────────────┬─────────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │  Add Cache Costs         │
                            │  (if applicable)         │
                            └────────────┬─────────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │  Total Cost Calculated   │
                            └────────────┬─────────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │  Log to Database         │
                            │  • SpendLogs table       │
                            │  • Update key/user/team  │
                            │  • Add to response header│
                            └──────────────────────────┘
```

---

## Summary: Key Takeaways

### 1. **Where Pricing is Managed**
- ✅ **LiteLLM Proxy** calculates all costs
- ❌ **Model Providers** only return token counts
- 📊 Costs are logged to LiteLLM's database

### 2. **Built-in Pricing**
- LiteLLM knows pricing for 100+ models automatically
- Maintained in `model_prices_and_context_window.json`
- Works out-of-the-box for major providers

### 3. **Custom Pricing Purpose**
- **Add new models**: Not in LiteLLM's cost map
- **Override pricing**: Different rates than built-in
- **Fix Azure mapping**: Correct model identification
- **SageMaker/custom**: Time-based or special pricing

### 4. **Best Practices**
- Use built-in pricing when possible (less maintenance)
- Add custom pricing for:
  - Fine-tuned models
  - Negotiated rates
  - Custom deployments
  - Self-hosted models
- Always set `base_model` for Azure deployments
- Test with `--detailed_debug` flag to verify pricing

### 5. **Cost Tracking Flow**
```
Request → Provider → Token Count → LiteLLM Calculation → Database → Reports
```

All cost tracking happens in LiteLLM, making it a centralized spend management layer across all your LLM providers.