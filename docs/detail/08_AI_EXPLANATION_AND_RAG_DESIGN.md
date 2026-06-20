# 08. AI EXPLANATION AND RAG DESIGN — pgvector + Guided Chat

## 1. Goal

Provide explanations grounded in:

```text
prediction output
feature breakdown
team form
odds movement
scheduled snapshots
retrieved contextual notes
```

AI chat is not a general chatbot. It is a match-context assistant.

## 2. RAG Storage

Qdrant is removed.

Use Supabase Postgres with pgvector:

```text
rag_documents
rag_document_chunks
rag_embeddings
```

## 3. Retrieval Flow

```text
User asks match question
  ↓
Backend validates auth/rate limit
  ↓
Backend calls Python AI /explain
  ↓
Python embeds query
  ↓
Python queries pgvector top-k chunks
  ↓
Python combines retrieved context + structured match data
  ↓
Answer generator produces bounded response
```

## 4. Guardrails

```text
Input length limit
Prompt injection detection
Allowed scope: match analytics only
No unsupported claims
Cite retrieved sources if used
Return safe unavailable response on failure
```

## 5. Failure Policy

If `/matches/{id}/full` insight fails:

```text
Return prediction
Set insightUnavailable = true
```

If standalone `/insights/ask` fails:

```json
{
  "error": "insightUnavailable",
  "message": "Insight chat is temporarily unavailable. Prediction data remains available."
}
```

## 6. RAG Metrics

```text
pgvector_retrieval_latency_ms
insight_latency_ms
insight_error_total
insight_circuit_open_total
retrieved_chunk_count
empty_retrieval_total
```

## 7. Future Phase

- Multi-source news ingestion.
- Better citation UI.
- Model-generated counterfactual explanations.
- Multi-market explanation for Total Goals / BTTS.
