'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?admin=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openNewCategoryModal = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: 'Coleção Oficial',
      displayOrder: categories.length + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    try {
      const isExisting = Boolean(editingCategory.id);
      const res = await fetch('/api/categories', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingCategory(null);
        loadCategories();
      } else {
        alert(data.error || 'Erro ao salvar categoria');
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir a categoria "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, active: !cat.active }),
      });
      const data = await res.json();
      if (data.success) {
        loadCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            Categorias & Fabricantes do Catálogo
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Organize marcas, subcategorias e coleções exibidas na loja e filtros.
          </p>
        </div>

        <button
          onClick={openNewCategoryModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-400">Carregando categorias...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id || idx}
              className="p-5 rounded-2xl bg-[#0f1422] border border-white/10 flex flex-col justify-between gap-4 hover:border-amber-400/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-neutral-800 font-mono text-[10px] font-bold flex items-center justify-center text-neutral-300">
                      #{cat.displayOrder}
                    </span>
                    <h3 className="text-white font-black text-base">{cat.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 block">
                    slug: /catalogo?marca={cat.slug}
                  </span>
                  {cat.description && (
                    <p className="text-neutral-300 text-xs mt-1">{cat.description}</p>
                  )}
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    cat.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {cat.active ? 'Ativa' : 'Oculta'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <button
                  onClick={() => handleToggleActive(cat)}
                  className="text-neutral-400 hover:text-white font-medium cursor-pointer"
                >
                  {cat.active ? 'Desativar' : 'Ativar'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
                    title="Editar Categoria"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 cursor-pointer"
                    title="Excluir Categoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e121b] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Nome da Categoria / Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mini GT, Dioramas, Acessórios..."
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setEditingCategory({ ...editingCategory, name, slug });
                  }}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Slug da URL</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-neutral-400 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Descrição / Subtítulo</label>
                <input
                  type="text"
                  placeholder="Ex: Réplicas de precisão 1:64"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={editingCategory.displayOrder ?? 1}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.active ?? true}
                      onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="font-bold text-white text-xs">Ativa no Catálogo</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
