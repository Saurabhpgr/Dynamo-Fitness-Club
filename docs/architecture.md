# Architecture Documentation — Dynamo Fitness Club

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer (SPA)"
        LP["Public Landing Page"]
        AUTH["Auth Module (Login / Reset)"]
        ADMIN["Admin Dashboard"]
        PDF["Digital Receipt Engine & Print Preview"]
    end

    subgraph "Client Service Layer"
        SVC["DataService (Dual-Mode Router)"]
        MEM["Offline / Demo Storage (Seeded LocalStorage)"]
        CLI["Supabase JS Client"]
    end

    subgraph "Backend Layer (Supabase / Postgres)"
        RLS["Row Level Security Policies"]
        RPCS["Atomic RPC Procedures"]
        TRIG["Audit Triggers & Sequences"]
        TABLES["PostgreSQL Tables & Views"]
    end

    LP --> SVC
    AUTH --> SVC
    ADMIN --> SVC
    PDF --> SVC

    SVC -->|Remote Configured| CLI
    SVC -->|Offline / Demo| MEM

    CLI --> RLS
    RLS --> RPCS
    RPCS --> TRIG
    TRIG --> TABLES
```

## Dual-Mode Operation
To ensure zero friction during local review and offline testing, the system provides an adaptive data layer:
1. **Live Supabase Mode**: Activated when valid Supabase API keys are set in `.env`. Queries execute against PostgreSQL with strict Row Level Security and Atomic RPCs.
2. **Demo Mode**: Enabled out-of-the-box when keys are omitted or set to development placeholders. The system seeds 20 realistic athletes, standard plans, transactions, receipts, and inquiries into localStorage with full reactivity.
