'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Key,
  Rss,
  FileSpreadsheet,
  Settings,
  History,
  CheckCircle2,
  AlertTriangle,
  Play,
  Upload,
  Link as LinkIcon,
  ShieldCheck,
  Percent,
  Camera,
  Sparkles,
} from 'lucide-react';
import { SupplierConfig, SyncLog, PricingRule } from '@/lib/types';
import { DEFAULT_PRICING_RULES, calculatePricing } from '@/lib/pricing';

export default function SupplierSyncPage() {
  const [activeTab, setActiveTab] = useState<'API' | 'FEED' | 'CSV' | 'PHOTO' | 'PRICING' | 'LOGS'>('API');
  const [config, setConfig] = useState<SupplierConfig | null>(null);
  const [pricingRules, setPricingRules] = useState<Record<string, PricingRule>>(DEFAULT_PRICING_RULES);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningSync, setRunningSync] = useState(false);

  // CSV upload state
  const [csvText, setCsvText] = useState(
    `sku,mgtCode,brand,scale,vehicleModel,colorOrEdition,costPrice,arrivalForecast,stock\nMGT01405,MGT01405,Mini GT,1:64,Ferrari 296 GTB,Rosso Corsa,64.00,Novembro de 2026,36\nKHMG062,KHMG062,Kaido House,1:64,Honda NSX Pro Street,Championship White,102.00,Dezembro de 2026,24`
  );

  // Photo import state
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoBrand, setPhotoBrand] = useState('Mini GT');
  const [photoModel, setPhotoModel] = useState('');
  const [photoCode, setPhotoCode] = useState('');
  const [photoColor, setPhotoColor] = useState('');
  const [photoCost, setPhotoCost] = useState('58.00');
  const [photoIsPreOrder, setPhotoIsPreOrder] = useState(true);
  const [photoForecast, setPhotoForecast] = useState('Outubro de 2026');
  const [photoStock, setPhotoStock] = useState('24');
  const [photoLoading, setPhotoLoading] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        // Tenta inferir nome do arquivo se for descritivo
        const nameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (!photoModel) {
          setPhotoModel(nameClean);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateFromPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoModel || !photoPreview) {
      alert('Por favor, carregue a foto da miniatura e informe o modelo do veículo.');
      return;
    }
    setPhotoLoading(true);
    try {
      const sku = photoCode.trim() || `RL-${photoBrand.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const cost = parseFloat(photoCost) || 55;
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: photoBrand,
          scale: '1:64',
          vehicleModel: photoModel,
          colorOrEdition: photoColor,
          sku,
          mgtCode: photoBrand === 'Mini GT' ? sku : undefined,
          costPrice: cost,
          isPreOrder: photoIsPreOrder,
          arrivalForecast: photoIsPreOrder ? photoForecast : undefined,
          stock: parseInt(photoStock, 10) || 24,
          status: config?.publishMode === 'REQUIRE_APPROVAL' ? 'AGUARDANDO_APROVACAO' : photoIsPreOrder ? 'PRE_VENDA' : 'PRONTA_ENTREGA',
          images: [
            {
              id: `img-upload-${Date.now()}`,
              url: photoPreview,
              isMain: true,
              order: 0,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Miniatura "${data.product.title}" cadastrada com sucesso a partir da foto!`);
        setPhotoPreview('');
        setPhotoModel('');
        setPhotoCode('');
        setPhotoColor('');
        loadSyncData();
      }
    } catch (err: any) {
      alert('Erro ao cadastrar miniatura: ' + err.message);
    } finally {
      setPhotoLoading(false);
    }
  };

  useEffect(() => {
    loadSyncData();
  }, []);

  const loadSyncData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      if (data.config) setConfig(data.config);
      if (data.pricingRules) setPricingRules(data.pricingRules);
      if (data.syncLogs) setSyncLogs(data.syncLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (updatedConfig: Partial<SupplierConfig>) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_CONFIG', config: updatedConfig }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig((prev) => ({ ...prev!, ...updatedConfig }));
        alert('Configurações do fornecedor atualizadas com sucesso!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerApiSync = async () => {
    setRunningSync(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_MINI_GT' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadSyncData();
      }
    } catch (e: any) {
      alert('Erro na sincronização: ' + e.message);
    } finally {
      setRunningSync(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    setRunningSync(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'IMPORT_CSV', csvText }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadSyncData();
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setRunningSync(false);
    }
  };

  const handleImportFeedUrl = async () => {
    setRunningSync(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'IMPORT_FEED_URL' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadSyncData();
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setRunningSync(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
              Sincronização com Fornecedor (Mini GT Brasil)
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Conecte a API autorizada, feeds XML/JSON, planilhas CSV e automatize o cálculo de margens e rascunhos de pré-vendas.
          </p>
        </div>

        <button
          onClick={handleTriggerApiSync}
          disabled={runningSync}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
        >
          <Play className={`w-4 h-4 ${runningSync ? 'animate-spin' : ''}`} />
          <span>{runningSync ? 'Processando...' : 'Executar Sincronização Agora'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('API')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'API'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Conexão API Oficial</span>
        </button>

        <button
          onClick={() => setActiveTab('FEED')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'FEED'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Rss className="w-4 h-4" />
          <span>Feed de Produtos (JSON / XML)</span>
        </button>

        <button
          onClick={() => setActiveTab('CSV')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'CSV'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Importar CSV / Planilha</span>
        </button>

        <button
          onClick={() => setActiveTab('PHOTO')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PHOTO'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Importar por Foto / Blister</span>
        </button>

        <button
          onClick={() => setActiveTab('PRICING')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PRICING'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Regras de Precificação por Marca</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'LOGS'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico & Auditoria ({syncLogs.length})</span>
        </button>
      </div>

      {/* Global Sync Automation Rules */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" /> Política de Publicação de Novos Lançamentos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <button
            onClick={() => handleSaveConfig({ publishMode: 'REQUIRE_APPROVAL' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              config?.publishMode === 'REQUIRE_APPROVAL'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-neutral-950 border-white/10 text-neutral-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white block font-bold">Exigir Aprovação Prévia</span>
              <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded">
                RECOMENDADO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Os novos lançamentos entram como &quot;Aguardando Aprovação&quot; para revisão do administrador antes de irem ao ar.
            </p>
          </button>

          <button
            onClick={() => handleSaveConfig({ publishMode: 'AUTO_PUBLISH' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              config?.publishMode === 'AUTO_PUBLISH'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-neutral-950 border-white/10 text-neutral-400'
            }`}
          >
            <span className="text-white block font-bold">Publicar Automaticamente</span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Assim que um novo produto é detectado no fornecedor, é calculado o preço e publicado imediatamente na loja.
            </p>
          </button>

          <button
            onClick={() => handleSaveConfig({ publishMode: 'DRAFT_ONLY' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              config?.publishMode === 'DRAFT_ONLY'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-neutral-950 border-white/10 text-neutral-400'
            }`}
          >
            <span className="text-white block font-bold">Importar apenas como Rascunho</span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Fica salvo como rascunho sem notificação de publicação pendente.
            </p>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-neutral-400">Frequência da Automação:</span>
            <select
              value={config?.syncFrequency || '1H'}
              onChange={(e) => handleSaveConfig({ syncFrequency: e.target.value as any })}
              className="bg-neutral-950 border border-white/10 rounded-lg px-3 py-1.5 text-white"
            >
              <option value="MANUAL">Apenas Manual</option>
              <option value="15M">A cada 15 minutos</option>
              <option value="1H">A cada 1 hora</option>
              <option value="DAILY">Diária (00:00)</option>
              <option value="WEBHOOK">Tempo Real via Webhook</option>
            </select>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono">
            Última sincronização com sucesso: {config?.lastSuccessfulSync ? new Date(config.lastSuccessfulSync).toLocaleString('pt-BR') : 'Nunca'}
          </div>
        </div>
      </div>

      {/* Tab 1: API Configuration */}
      {activeTab === 'API' && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" /> Credenciais da API Oficial Mini GT Brasil
          </h3>
          <p className="text-xs text-neutral-400">
            A integração é realizada prioritariamente por API autorizada, protegida por chave privada e sem scraping agressivo.
          </p>

          <div className="space-y-4 text-xs max-w-xl">
            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Endpoint da API</label>
              <input
                type="text"
                value={config?.apiEndpoint || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev!, apiEndpoint: e.target.value }))}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">API Key / Bearer Token Oficial</label>
              <input
                type="password"
                value={config?.apiKey || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev!, apiKey: e.target.value }))}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleSaveConfig({ apiEndpoint: config?.apiEndpoint, apiKey: config?.apiKey })}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                Salvar Credenciais
              </button>
              <button
                onClick={handleTriggerApiSync}
                disabled={runningSync}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold border border-white/10"
              >
                Testar Conexão & Consultar Lançamentos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feed URL */}
      {activeTab === 'FEED' && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Rss className="w-4 h-4 text-amber-400" /> Sincronização por Feed de Produtos (JSON / XML)
          </h3>
          <p className="text-xs text-neutral-400">
            Insira o link do catálogo em feed disponibilizado pelo distribuidor para sincronização periódica e contínua.
          </p>

          <div className="space-y-4 text-xs max-w-xl">
            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">URL do Feed</label>
              <input
                type="text"
                placeholder="https://fornecedor.com.br/feed.json"
                value={config?.feedUrl || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev!, feedUrl: e.target.value }))}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImportFeedUrl}
                disabled={runningSync}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                Sincronizar Feed Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CSV Import */}
      {activeTab === 'CSV' && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Importador de Planilha e Arquivo CSV
          </h3>
          <p className="text-xs text-neutral-400">
            Cole ou carregue a planilha de catálogo fornecida pelo Mini GT Brasil com as colunas oficiais.
          </p>

          <div className="space-y-3 text-xs">
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-white focus:outline-none focus:border-amber-500"
            />

            <button
              onClick={handleImportCsv}
              disabled={runningSync}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Processar e Importar Planilha CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3.5: Photo / Blister Import */}
      {activeTab === 'PHOTO' && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" /> Importar Miniatura por Foto / Imagem do Blister
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Tire ou selecione uma foto da miniatura/blister. Você também pode enviar fotos diretamente na conversa com o assistente para cadastro 100% automático!
            </p>
          </div>

          <form onSubmit={handleCreateFromPhoto} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Image upload & preview */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-4/3 w-full rounded-2xl bg-neutral-950 border-2 border-dashed border-white/15 hover:border-amber-500/50 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all group">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-bold gap-1">
                      <Upload className="w-5 h-5 text-amber-400" />
                      <span>Trocar Foto</span>
                      <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer text-center space-y-2 p-6 w-full h-full">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-white text-xs block">Clique para enviar a foto da miniatura</span>
                    <span className="text-[10px] text-neutral-500">ou arraste e solte o arquivo aqui (PNG, JPG, WEBP)</span>
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Right: Data inputs & automated pricing */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Marca</label>
                  <select
                    value={photoBrand}
                    onChange={(e) => setPhotoBrand(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="Mini GT">Mini GT</option>
                    <option value="Kaido House">Kaido House</option>
                    <option value="Tarmac Works">Tarmac Works</option>
                    <option value="Pop Race">Pop Race</option>
                    <option value="Inno64">Inno64</option>
                    <option value="Hot Wheels">Hot Wheels</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Código MGT / SKU</label>
                  <input
                    type="text"
                    placeholder="Ex: MGT01399"
                    value={photoCode}
                    onChange={(e) => setPhotoCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Modelo do Veículo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lamborghini Revuelto, BMW Z3, Skyline GT-R..."
                  value={photoModel}
                  onChange={(e) => setPhotoModel(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Cor / Livery / Edição</label>
                  <input
                    type="text"
                    placeholder="Ex: Arancio Apodis, Bayside Blue, Chase..."
                    value={photoColor}
                    onChange={(e) => setPhotoColor(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={photoCost}
                    onChange={(e) => setPhotoCost(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Disponibilidade</label>
                  <select
                    value={photoIsPreOrder ? 'true' : 'false'}
                    onChange={(e) => setPhotoIsPreOrder(e.target.value === 'true')}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="true">Pré-Venda (com entrada + saldo)</option>
                    <option value="false">Pronta-Entrega (estoque imediato)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Previsão ou Estoque</label>
                  {photoIsPreOrder ? (
                    <input
                      type="text"
                      placeholder="Ex: Novembro de 2026"
                      value={photoForecast}
                      onChange={(e) => setPhotoForecast(e.target.value)}
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                    />
                  ) : (
                    <input
                      type="number"
                      placeholder="Estoque"
                      value={photoStock}
                      onChange={(e) => setPhotoStock(e.target.value)}
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={photoLoading || !photoPreview}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {photoLoading
                    ? 'Processando e Cadastrando...'
                    : 'Cadastrar Miniatura Automaticamente com esta Foto'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Pricing Rules by Brand */}
      {activeTab === 'PRICING' && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" /> Motor de Precificação Automática por Marca
          </h3>
          <p className="text-xs text-neutral-400">
            Fórmula: <code>Preço = Custo + Margem% + Lucro Fixo + Taxas Gateway + Embalagem + Margem Segurança</code>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Marca</th>
                  <th className="p-3">Margem (%)</th>
                  <th className="p-3">Lucro Fixo (R$)</th>
                  <th className="p-3">Taxa Gateway (%)</th>
                  <th className="p-3">Embalagem (R$)</th>
                  <th className="p-3">Entrada (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {Object.entries(pricingRules).map(([brand, rule]) => (
                  <tr key={brand}>
                    <td className="p-3 font-bold text-amber-400 font-sans">{brand}</td>
                    <td className="p-3">{rule.profitMarginPercent}%</td>
                    <td className="p-3">R$ {rule.fixedProfit.toFixed(2)}</td>
                    <td className="p-3">{rule.gatewayFeePercent}%</td>
                    <td className="p-3">R$ {rule.packagingCost.toFixed(2)}</td>
                    <td className="p-3">{rule.defaultDownPaymentPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit & Sync Logs */}
      {activeTab === 'LOGS' && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" /> Registro Completo de Sincronizações (Auditoria)
          </h3>

          <div className="space-y-4 text-xs">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl bg-neutral-950/80 border border-white/5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{log.source}</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                      Modo: {log.mode}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex gap-4 text-neutral-300 text-[11px] border-y border-white/5 py-1.5">
                  <span>Processados: <strong>{log.itemsProcessed}</strong></span>
                  <span>Novos: <strong className="text-emerald-400">{log.itemsAdded}</strong></span>
                  <span>Atualizados: <strong className="text-amber-400">{log.itemsUpdated}</strong></span>
                  <span>Ignorados (Duplicidade): <strong className="text-neutral-500">{log.itemsSkipped}</strong></span>
                </div>

                {log.changes && log.changes.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Campos Atualizados:</span>
                    {log.changes.map((c, i) => (
                      <div key={i} className="text-[11px] text-neutral-400 font-mono">
                        • SKU {c.sku}: <strong>{c.field}</strong> alterado de &quot;{c.oldValue}&quot; para &quot;{c.newValue}&quot;
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
