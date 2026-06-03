import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, type BlogPost } from '@/lib/api';
import Icon from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function JournalPostPage({ params }: { params: { slug: string } }) {
  let post: BlogPost;
  try {
    post = await api.blogPost(params.slug);
  } catch {
    notFound();
  }

  return (
    <main>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="crumbs">
          <Link href="/">Home</Link><span className="sep">/</span>
          <Link href="/journal">Journal</Link><span className="sep">/</span>
          <span className="cur">{post!.title}</span>
        </div>

        <article className="article">
          <span className="eyebrow"><Icon name={post!.icon} size={15} stroke={2} /> {post!.tag}</span>
          <h1>{post!.title}</h1>
          <p className="count-label">{new Date(post!.createdAt).toLocaleDateString()}</p>
          <p className="lead" style={{ marginTop: 18 }}>{post!.excerpt}</p>
          <div className="article-body">
            {post!.body.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <Link href="/journal" className="link-arrow" style={{ marginTop: 28 }}>
            <Icon name="arrowLeft" size={16} stroke={2} /> All guides
          </Link>
        </article>
      </div>
    </main>
  );
}
