# RL Diecast • E-commerce de Miniaturas Colecionáveis 1:64

Este é o repositório oficial da plataforma de e-commerce **RL Diecast**, especializada na venda de miniaturas diecast 1:64 para colecionadores, com foco em pré-vendas com entrada e saldo posterior, pronta-entrega, integração com o distribuidor oficial (Mini GT Brasil) e sistema "Minha Garagem".

---

## 🏎️ Estrutura do Projeto

- **Framework**: Next.js 16 (App Router + Turbopack) + TypeScript + Tailwind CSS v4 + Lucide Icons.
- **Banco de Dados**: `data/rl_diecast_db.json` (66 miniaturas reais importadas com fotos HD oficiais, pedidos, pré-vendas e itens da garagem).
- **Modelagem SQL/ORM**: `prisma/schema.prisma` e `supabase/schema.sql` (25 tabelas mapeadas).
- **Integração Fornecedor**: `src/lib/sync-engine.ts` e `scripts/import_live_minigt.js` (conectado à API do Mini GT Brasil `https://www.minigtbrasil.com.br/api/products`).

---

## 🎨 Design System Premium

- **Cores Principais**:
  - Obsidiana Profunda (`#080a0f`) para o showroom escuro e refinado.
  - Ouro Racing Metalizado (`#f59e0b` / `#fbbf24`) para botões de ação e títulos (`.gold-gradient-text`).
  - Verde Esmeralda Mint (`#10b981`) para Pronta-Entrega e descontos no Pix.
- **Tipografia & Componentes**:
  - Cards estilo vitrine com cantos `rounded-3xl` e microiluminação dourada.
  - Botões de alta conversão em preto sobre ouro.

---

## 🚀 Como Iniciar o Servidor

```bash
npm run dev
```

Acesse no navegador:
- Local: [http://localhost:3000](http://localhost:3000)
- Rede: `http://192.168.0.2:3000`

---

## 📌 Rotas Principais

- `/`: Home Showroom
- `/catalogo`: Catálogo completo com filtros avançados
- `/pre-vendas`: Vitrine de pré-vendas com reserva por entrada
- `/pronta-entrega`: Vitrine de envio imediato
- `/produto/[slug]`: Página do colecionável com simulador de frete
- `/carrinho` e `/checkout`: Checkout brasileiro (Pix com QR Code, Cartão até 12x, Boleto)
- `/garagem`: Sistema de catalogação pessoal do colecionador
- `/conta`: Painel do cliente e pagamento de saldo
- `/admin`: Painel do lojista
- `/admin/sincronizacao`: Sincronização de fornecedor e upload por foto de blister
