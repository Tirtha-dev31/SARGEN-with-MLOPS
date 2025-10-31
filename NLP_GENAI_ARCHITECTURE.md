# SARGEN – NLP/GenAI Architecture (Concise)

Purpose
- Explain the NLP/GenAI pieces used, how they connect, and why they fit AML SAR generation.

System overview
- Frontend: React + Vite (TypeScript)
- Backend: FastAPI
- Data: CSV files (transactions, accounts, known-pattern accounts)
- AI runtime: Ollama (local) using Llama 3.2
- Reports: PDF via ReportLab

High-level flows
1) AI Chat
   User question → Backend builds compact context → Llama 3.2 generates brief answer → UI shows reply.
2) SAR Narrative
   Case selected → Backend computes stats/patterns → Template + LLM for narrative text → PDF export.

NLP/GenAI modules actually used
1) Context Builder (backend)
   - Summaries: totals, counts, date range, patterns, top cases.
   - Conditional context: load details only when asked (fast, fewer tokens).

2) Prompt Engineering
   - System style: “Compliance AI, answer briefly and professionally.”
   - Chat prompt: quick stats + 2–3 sentence constraint (temperature=0.3, max_tokens≈150).
   - SAR prompt: 8-section outline (Executive summary, Activity, Timeline, Patterns, Risk, Evidence, Recommendations).

3) Template‑Guided Generation
   - Deterministic numbers (amounts, counts) are computed in Python.
   - LLM provides regulatory wording/explanations around those numbers.
   - Reduces hallucinations and enforces structure.

4) Light Retrieval (RAG‑lite)
   - No vector DB; data is tabular.
   - On demand attach: top‑N case summaries or filtered transactions.
   - Keeps prompts compact and relevant.

5) Post‑processing & Validation
   - Split narrative into named sections, normalize whitespace.
   - Sanity checks: presence of totals, counts, dates.

6) Guardrails
   - Temperature=0.3, top_p=0.9, max_tokens bounds.
   - Response length rules and section headers.

Optional hooks (scalable later)
- NER (spaCy) for extracting entities from free‑text notes.
- Embeddings (sentence‑transformers) + vector store if unstructured knowledge grows.

Model used
- Llama 3.2 via Ollama (local, offline).
- Decoder‑only Transformer; accessed with options {temperature, top_p, max_tokens}.
- Privacy‑first: data stays on machine.

Why this works for AML
- Facts are structured → computed deterministically.
- LLM adds compliance language and explanation.
- Targeted context → predictable, fast, local.

Sequence (condensed)
AI Chat:
User → React → POST /api/ai/chat → Build prompt (quick stats + optional case list) → Ollama(Llama3.2) → Return 2–3 sentence answer.

SAR Generation:
User selects case → POST /api/cases/{id}/generate-sar → Compute stats/patterns → Fill template + LLM phrasing → Return sections → Export PDF.
