'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Plant } from '@/lib/plants';
import Icon from '@/components/Icon';

const EMPTY = {
  slug: '', name: '', botanical: '', description: '', price: 0, oldPrice: '',
  category: 'Indoor', light: 'Bright, indirect', water: 'Weekly', difficulty: 'Easy',
  petSafe: false, badge: '', icon: 'leaf', stock: 0,
};

function PlantsAdmin() {
  const params = useSearchParams();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.plants().then(setPlants).catch(() => {});
    api.categories().then((c) => setCategories(c.filter((x) => x !== 'All plants' && x !== 'Pet-safe'))).catch(() => {});
  }, []);

  useEffect(load, [load]);

  const startEdit = useCallback((p: Plant) => {
    setEditing(p.slug ?? p.id);
    setForm({
      slug: p.slug ?? p.id, name: p.name, botanical: p.botanical, description: p.description ?? '',
      price: p.price, oldPrice: p.oldPrice?.toString() ?? '', category: p.cat, light: p.light,
      water: p.water, difficulty: p.difficulty, petSafe: p.petSafe, badge: p.badge ?? '',
      icon: p.icon, stock: p.stock ?? 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // deep-link ?edit=slug (e.g. from dashboard "Restock")
  useEffect(() => {
    const slug = params.get('edit');
    if (slug && plants.length) {
      const p = plants.find((x) => (x.slug ?? x.id) === slug);
      if (p) startEdit(p);
    }
  }, [params, plants, startEdit]);

  const reset = () => { setEditing(null); setForm({ ...EMPTY }); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    try {
      await api.adminUpsertPlant({
        name: form.name, botanical: form.botanical, description: form.description,
        price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        category: form.category, light: form.light, water: form.water, difficulty: form.difficulty,
        petSafe: form.petSafe, badge: form.badge || undefined, icon: form.icon, stock: Number(form.stock),
      }, editing ?? undefined);
      setMsg(editing ? 'Plant updated.' : 'Plant created.');
      reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const remove = async (slug: string) => {
    if (!confirm('Delete this plant?')) return;
    try { await api.adminDeletePlant(slug); load(); } catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  return (
    <div>
      <h1>{editing ? `Edit: ${form.name}` : 'Add a plant'}</h1>
      <p className="count-label" style={{ marginBottom: 20 }}>{editing ? 'Update catalog details and stock.' : 'Create a new catalog listing.'}</p>

      <form className="admin-form" onSubmit={submit}>
        <div className="field-row">
          <label className="field"><span>Name</span><input required value={form.name} onChange={setF('name')} /></label>
          <label className="field"><span>Botanical</span><input required value={form.botanical} onChange={setF('botanical')} /></label>
        </div>
        <label className="field"><span>Description</span><textarea rows={2} value={form.description} onChange={setF('description')} /></label>
        <div className="field-row">
          <label className="field"><span>Price ($)</span><input type="number" min={0} required value={form.price} onChange={setF('price')} /></label>
          <label className="field"><span>Old price ($)</span><input type="number" min={0} value={form.oldPrice} onChange={setF('oldPrice')} /></label>
          <label className="field"><span>Stock</span><input type="number" min={0} required value={form.stock} onChange={setF('stock')} /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Category</span>
            <select value={form.category} onChange={setF('category')}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field"><span>Difficulty</span>
            <select value={form.difficulty} onChange={setF('difficulty')}>
              {['Easy', 'Hard to kill', 'Fussy'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <div className="field-row">
          <label className="field"><span>Light</span><input value={form.light} onChange={setF('light')} /></label>
          <label className="field"><span>Water</span><input value={form.water} onChange={setF('water')} /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Badge (optional)</span><input value={form.badge} onChange={setF('badge')} placeholder="New, Bestseller…" /></label>
          <label className="field"><span>Icon</span>
            <select value={form.icon} onChange={setF('icon')}>
              {['leaf', 'sprout', 'tree', 'flower'].map((i) => <option key={i}>{i}</option>)}
            </select>
          </label>
          <label className="field check"><input type="checkbox" checked={form.petSafe} onChange={setF('petSafe')} /> <span>Pet-safe</span></label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {msg && <p className="form-ok">{msg}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary">{editing ? 'Save changes' : 'Create plant'}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="admin-section">
        <h3><Icon name="leaf" size={17} /> Catalog ({plants.length})</h3>
        <div className="admin-table">
          {plants.map((p) => (
            <div className="admin-row" key={p.slug ?? p.id}>
              <span>{p.name}</span>
              <span className="count-label">${p.price}</span>
              <span className={'badge ' + ((p.stock ?? 0) <= 3 ? '' : 'success')}>{p.stock ?? 0} in stock</span>
              <button className="link-arrow" style={{ fontSize: 14 }} onClick={() => startEdit(p)}>Edit</button>
              <button className="cart-remove" onClick={() => remove(p.slug ?? p.id)} aria-label="Delete"><Icon name="trash" size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPlantsPage() {
  return (
    <Suspense fallback={<p className="count-label">Loading…</p>}>
      <PlantsAdmin />
    </Suspense>
  );
}
