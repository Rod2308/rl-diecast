# Guia de Integração Oficial • Mini GT Brasil & Fornecedores (RL Diecast)

Este documento orienta os desenvolvedores e administradores da **RL Diecast** sobre como conectar, sincronizar e manter a integração com a **Mini GT Brasil** (ou fornecedores e distribuidores parceiros) de forma autorizada, ética, segura e resiliente.

---

## 1. Princípios de Segurança e Boas Práticas

Conforme as diretrizes da RL Diecast:
1. **Sem Scraping Agressivo**: Não realizamos scraping desordenado, raspagens destrutivas ou bypass de proteções (Cloudflare/WAF).
2. **Uso de Canais Oficiais**: A sincronização ocorre exclusivamente por:
   - **API REST / GraphQL Autorizada** via Bearer Token / API Key;
   - **Feed de Produtos (JSON ou XML/RSS)** disponibilizado pelo distribuidor;
   - **Planilhas Oficiais (CSV / Excel)** enviadas comercialmente;
   - **Webhooks oficiais** disparados pelo fornecedor na abertura de novos lotes.
3. **Respeito aos Direitos de Uso de Imagem**: As imagens vinculadas são providas pelos canais de divulgação do distribuidor para revendedores autorizados.

---

## 2. Métodos de Integração Suportados

No Painel Administrativo em `/admin/sincronizacao`, você encontra quatro métodos de ingestão de dados:

### Método A: API Oficial com Token de Acesso (Recomendado)
- **Configuração no Painel**:
  - `Endpoint da API`: Ex: `https://api.minigtbrasil.com.br/v2/catalog`
  - `API Key / Bearer Token`: Inserido no campo seguro de credenciais.
- **Frequência Programada**:
  - Manual, A cada 15 minutos, A cada hora, Diária (meia-noite) ou por Webhook.
- **Payload esperado (Exemplo)**:
```json
{
  "products": [
    {
      "sku": "MGT01386",
      "mgt_code": "MGT01386",
      "brand": "Mini GT",
      "scale": "1:64",
      "vehicle_model": "BMW Z3",
      "color_edition": "Hellrot",
      "cost_price": 58.00,
      "is_preorder": true,
      "arrival_forecast": "Julho de 2026",
      "stock_available": 36,
      "packaging": "Caixa Box Lacrada",
      "image_url": "https://cdn.minigtbrasil.com.br/mgt01386.jpg"
    }
  ]
}
```

### Método B: URL de Feed de Produtos (JSON / XML)
Se o fornecedor não possuir uma API autenticada, mas fornecer um feed HTTP/HTTPS público ou com chave na query:
- Insira a URL no campo `Feed URL` em `/admin/sincronizacao`;
- O motor de sincronização consome o feed sem onerar o servidor de origem, respeitando headers `ETag` e `Last-Modified`.

### Método C: Importação por Arquivo CSV / Planilha
Caso a tabela de novos lotes seja enviada por e-mail ou WhatsApp pelo distribuidor em formato de planilha:
- Cole o texto CSV ou faça upload na aba **Importar CSV / Planilha**;
- Formato padrão de colunas suportado:
```csv
sku,mgtCode,brand,scale,vehicleModel,colorOrEdition,costPrice,arrivalForecast,stock,packagingType,imageUrl
MGT01405,MGT01405,Mini GT,1:64,Ferrari 296 GTB,Rosso Corsa,64.00,Novembro de 2026,36,Caixa Box,https://...
KHMG062,KHMG062,Kaido House,1:64,Honda NSX Pro Street,Championship White,102.00,Dezembro de 2026,24,Caixa Luxo,https://...
```

### Método D: Webhook em Tempo Real
Configure o endpoint na plataforma do distribuidor:
- **URL do Webhook**: `https://seu-dominio.com.br/api/sync`
- **Método**: `POST`
- **Cabeçalho**: `X-Supplier-Signature: sha256=...`

---

## 3. Políticas de Publicação de Novos Lançamentos

Antes de disponibilizar um produto importado para venda, o administrador pode escolher no painel entre:

1. **Exigir Aprovação Prévia (Padrão Recomendado)**:
   - O produto é importado, recebe precificação automática e vai para a fila **"Aguardando Aprovação"** em `/admin/produtos`;
   - O administrador confere a foto, a descrição padronizada e clica em **Aprovar** com um único clique.
2. **Publicar Automaticamente**:
   - Ideal para lojas de alta rotatividade. O produto vai diretamente para a vitrine com status `PRE_VENDA` ou `PRONTA_ENTREGA`.
3. **Importar apenas como Rascunho**:
   - Salva o produto como `RASCUNHO`, sem exibição pública.

---

## 4. Motor de Precificação Automática

O sistema aplica automaticamente a fórmula configurada para cada marca:

$$\text{Preço de Venda} = \frac{\text{Custo} + \text{Lucro Fixo} + \text{Embalagem} + \text{Margem de Segurança}}{1 - \text{Taxa Gateway \%}}$$

### Regras Padrão por Marca (Customizáveis no Painel):
- **Mini GT**: 35% de margem, R$ 14,00 lucro fixo, 4,99% gateway, R$ 6,00 embalagem blindada, R$ 5,00 margem de segurança. Entrada padrão: 15% (mínimo R$ 15,00).
- **Kaido House**: 40% de margem, R$ 22,00 lucro fixo, R$ 7,00 embalagem especial.
- **Tarmac Works**: 38% de margem, R$ 18,00 lucro fixo.
- **Pop Race**: 35% de margem, R$ 15,00 lucro fixo.

---

## 5. Prevenção de Duplicidades (Deduplicação Inteligente)

O sistema nunca cria cadastros duplicados. O algoritmo de checagem avalia em cascata:
1. `SKU` exato;
2. `Código MGT` (quando presente);
3. Código de barras / EAN original;
4. Combinação de `Marca + Modelo do Veículo + Edição`.

Caso o produto já exista no banco de dados, o sistema **atualiza** os campos alterados (ex: variação no preço de custo, mudança na previsão de chegada ou esgotamento de estoque) e registra a alteração no **Log de Auditoria**.

---

## 6. Fluxo de Chegada do Lote & Quitação do Saldo

1. Quando o distribuidor entrega o lote físico no depósito da RL Diecast:
2. O administrador acessa `/admin/pre-vendas`;
3. Clica no botão **"Marcar Chegada"** da miniatura;
4. O sistema altera o status para `CHEGOU_ESTOQUE` e gera automaticamente o código **Pix Copia e Cola** do saldo;
5. O cliente recebe notificação e na área `/conta` pode quitar o saldo restante;
6. Após a quitação (validada pelo webhook do gateway), o botão de **"Despachar Envio"** é habilitado para inserção do código de rastreamento dos Correios (ex: `BR123456789RL`).
