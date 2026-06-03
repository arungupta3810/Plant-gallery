'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PLANTS, CATEGORIES } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import Icon from '@/components/Icon';

export default function ShopPage() {
  const [cat, setCat] = useState('All plants');
  const [sort, setSort] = useState('featured');
  const [light, setLight] = useState<Record<string, boolean>>({});
  const [diff, setDiff] = useState<Record<string, boolean>>({});

  const lights = ['Low to bright', 'Bright, indirect', 'Bright, direct', 'Medium, indirect'];
  const diffs = ['Hard to kill', 'Easy', 'Fussy'];

  let list = PLANTS.filter((p) => {
    if (cat === 'Pet-safe') return p.petSafe;
    if (cat !== 'All plants' && p.cat !== cat) return false;
    return true;
  });
  const aL = Object.keys(light).filter((k) => light[k]);
  const aD = Object.keys(diff).filter((k) => diff[k]);
  if (aL.length) list = list.filter((p) => aL.includes(p.light));
  if (aD.length) list = list.filter((p) => aD.includes(p.difficulty));
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);

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
            <p className="count-label">{list.length} plants · grown in our own greenhouse</p>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="filters">
            <div className="filter-group">
              <h4>Category</h4>
              {CATEGORIES.map((c) => (
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
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </div>
            </div>
            {list.length === 0 ? (
              <div className="empty">
                <span className="ic"><Icon name="search" size={28} /></span>
                <h4>No plants match those filters</h4>
                <p>Try loosening up — most of our plants are happy in a range of spots.</p>
                <button className="btn btn-outline" onClick={() => { setLight({}); setDiff({}); setCat('All plants'); }}>Clear filters</button>
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
