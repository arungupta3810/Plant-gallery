'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Plant } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import Icon from '@/components/Icon';

export default function ShopPage() {
  const [cat, setCat] = useState('All plants');
  const [sort, setSort] = useState<'featured' | 'low' | 'high'>('featured');
  const [light, setLight] = useState<Record<string, boolean>>({});
  const [diff, setDiff] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  const [categories, setCategories] = useState<string[]>(['All plants', 'Pet-safe']);
  const [list, setList] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lights = ['Low to bright', 'Bright, indirect', 'Bright, direct', 'Medium, indirect'];
  const diffs = ['Hard to kill', 'Easy', 'Fussy'];

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // load categories once
  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const activeLight = useMemo(() => Object.keys(light).filter((k) => light[k]).join(','), [light]);
  const activeDiff = useMemo(() => Object.keys(diff).filter((k) => diff[k]).join(','), [diff]);

  // fetch whenever filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.plants({
      category: cat,
      q: debouncedQ || undefined,
      light: activeLight || undefined,
      difficulty: activeDiff || undefined,
      sort,
    })
      .then((data) => { if (!cancelled) setList(data); })
      .catch((e) => { if (!cancelled) setError(e.message ?? 'Failed to load plants'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cat, debouncedQ, activeLight, activeDiff, sort]);

  const clearAll = () => { setLight({}); setDiff({}); setCat('All plants'); setQ(''); };

  return (
    <main>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link><span className="sep">/</span><span className="cur">Shop</span>
        </div>
        <div className="shop-head">
          <div>
            <span className="eyebrow"><Icon name="leaf" size={15} stroke={2} /> The collection</span>
            <h1>All plants</h1>
            <p className="count-label">{loading ? 'Loading…' : `${list.length} plants · grown in our own greenhouse`}</p>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="filters">
            <div className="filter-group">
              <h4>Search</h4>
              <div className="searchbox">
                <Icon name="search" size={17} color="var(--fg-3)" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plants…" aria-label="Search plants" />
              </div>
            </div>
            <div className="filter-group">
              <h4>Category</h4>
              {categories.map((c) => (
                <label key={c} className={'filter-opt' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>
                  <span className="box" style={{ borderRadius: '50%' }}>{cat === c && <Icon name="check" size={12} stroke={3} />}</span>{c}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Light</h4>
              {lights.map((l) => (
                <label key={l} className={'filter-opt' + (light[l] ? ' on' : '')} onClick={() => setLight((s) => ({ ...s, [l]: !s[l] }))}>
                  <span className="box">{light[l] && <Icon name="check" size={12} stroke={3} />}</span>{l}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Difficulty</h4>
              {diffs.map((d) => (
                <label key={d} className={'filter-opt' + (diff[d] ? ' on' : '')} onClick={() => setDiff((s) => ({ ...s, [d]: !s[d] }))}>
                  <span className="box">{diff[d] && <Icon name="check" size={12} stroke={3} />}</span>{d}
                </label>
              ))}
            </div>
          </aside>

          <div>
            <div className="shop-toolbar">
              <div className="pills">
                {['All plants', 'Indoor', 'Low light', 'Pet-safe', 'Statement'].map((c) => (
                  <button key={c} className={'pill' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
                ))}
              </div>
              <div className="sortbox">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as 'featured' | 'low' | 'high')}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </div>
            </div>

            {error ? (
              <div className="empty">
                <span className="ic"><Icon name="x" size={28} /></span>
                <h4>Couldn&apos;t load the collection</h4>
                <p>{error}</p>
                <button className="btn btn-outline" onClick={() => setCat((c) => c)}>Try again</button>
              </div>
            ) : loading ? (
              <div className="plant-grid cols-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="pcard skeleton" />)}
              </div>
            ) : list.length === 0 ? (
              <div className="empty">
                <span className="ic"><Icon name="search" size={28} /></span>
                <h4>No plants match those filters</h4>
                <p>Try loosening up — most of our plants are happy in a range of spots.</p>
                <button className="btn btn-outline" onClick={clearAll}>Clear filters</button>
              </div>
            ) : (
              <div className="plant-grid cols-3">
                {list.map((p) => <PlantCard key={p.id} plant={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
