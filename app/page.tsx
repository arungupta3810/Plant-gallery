import Link from 'next/link';
import { PLANTS } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import Icon from '@/components/Icon';

export default function HomePage() {
  const featured = PLANTS.slice(0, 4);
  const guides = [
    { icon: 'droplets', tag: 'Watering', t: 'How to tell when your plant is actually thirsty' },
    { icon: 'sun', tag: 'Light', t: "Reading your room's light like a plant would" },
    { icon: 'scissors', tag: 'Pruning', t: 'A gentle guide to your first trim' },
  ];
  return (
    <main>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="rise">
            <span className="eyebrow"><Icon name="leaf" size={15} stroke={2} /> The greenhouse, online</span>
            <h1>Plants that are <em>hard to kill.</em></h1>
            <p className="lead">Hand-grown, healthy, and matched to your light. Tell us about your space and we&apos;ll help you find a plant that thrives.</p>
            <div className="hero-cta">
              <Link href="/shop" className="btn btn-primary btn-lg">Shop plants <Icon name="arrowRight" size={18} stroke={2} color="#fff" /></Link>
              <Link href="/shop" className="btn btn-outline btn-lg">Find your plant</Link>
            </div>
            <div className="hero-trust">
              <span className="t"><Icon name="truck" size={19} stroke={1.9} /> 2–3 day delivery</span>
              <span className="t"><Icon name="shield" size={19} stroke={1.9} /> Healthy-arrival guarantee</span>
              <span className="t"><Icon name="sprout" size={19} stroke={1.9} /> Care help included</span>
            </div>
          </div>
          <div className="rise">
            <div className="hero-figure"><Icon name="leaf" size={180} stroke={1} color="rgba(255,255,255,.55)" /></div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 8 }}>
        <div className="valueprops">
          <div className="valueprop"><span className="ic"><Icon name="truck" size={22} /></span><div><h4>Delivered with care</h4><p>Packed safe and shipped fast, so plants arrive happy in 2–3 days.</p></div></div>
          <div className="valueprop"><span className="ic"><Icon name="sprout" size={22} /></span><div><h4>Matched to your light</h4><p>Filter by your space and skill level — never the wrong plant again.</p></div></div>
          <div className="valueprop"><span className="ic"><Icon name="droplets" size={22} /></span><div><h4>Care that sticks</h4><p>Every plant ships with a care card, plus optional watering reminders.</p></div></div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <div>
            <span className="eyebrow"><Icon name="leaf" size={15} stroke={2} /> Just in</span>
            <h2>Fresh from the greenhouse</h2>
            <p>A handpicked edit of easygoing favourites and a few statement pieces.</p>
          </div>
          <Link href="/shop" className="link-arrow">Shop all <Icon name="arrowRight" size={17} stroke={2} /></Link>
        </div>
        <div className="plant-grid">
          {featured.map((p) => <PlantCard key={p.id} plant={p} />)}
        </div>
      </section>

      <section className="wrap">
        <div className="band">
          <div>
            <span className="eyebrow"><Icon name="sprout" size={15} stroke={2} color="#A5D6A7" /> Not sure where to start?</span>
            <h2>Find your perfect plant in 4 questions.</h2>
            <p>Tell us about your light, your space, and how often you remember to water. We&apos;ll match you with plants you can actually keep alive.</p>
            <div style={{ marginTop: 28 }}>
              <Link href="/shop" className="btn btn-light btn-lg">Take the quiz <Icon name="arrowRight" size={18} stroke={2} color="#2E7D32" /></Link>
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 120 }}>
            <Icon name="leaf" size={200} stroke={1} className="band-glyph" />
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <div><span className="eyebrow"><Icon name="droplet" size={15} stroke={2} /> From the journal</span><h2>Plant care, made simple</h2></div>
          <Link href="/shop" className="link-arrow">All guides <Icon name="arrowRight" size={17} stroke={2} /></Link>
        </div>
        <div className="valueprops">
          {guides.map((g) => (
            <Link key={g.t} href="/shop" className="valueprop" style={{ flexDirection: 'column', gap: 14, textDecoration: 'none' }}>
              <span className="ic"><Icon name={g.icon} size={22} /></span>
              <div>
                <span className="eyebrow" style={{ fontSize: 11 }}>{g.tag}</span>
                <h4 style={{ fontSize: 17, marginTop: 6 }}>{g.t}</h4>
                <span className="link-arrow" style={{ fontSize: 14, marginTop: 6 }}>Read guide <Icon name="arrowRight" size={15} stroke={2} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
