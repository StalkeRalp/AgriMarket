import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Clock3, Sprout, UserRound } from "lucide-react";
import { BLOG_POSTS } from "@/lib/data/blog";
import { BLOG_ARTICLE_DETAILS } from "@/lib/data/blog-content";

function findPost(id) {
  return BLOG_POSTS.find((post) => post.id === id || post.slug === id);
}

function categoryOf(post) {
  if (post.category) return post.category;
  const text = `${post.title || ""} ${post.excerpt || ""}`.toLowerCase();
  if (/avicole|élevage|poulet|poussinière|provende/.test(text)) return "Élevage";
  if (/maïs|plantain|bananeraie|semis|fertilisation|culture/.test(text)) return "Cultures";
  return "Conseils pratiques";
}

function formatDate(value) {
  if (!value) return "Conseils AgriMarket";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "Conseils AgriMarket"
    : new Intl.DateTimeFormat("fr-CM", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function generateStaticParams() {
  return BLOG_POSTS.flatMap((post) => [
    { id: post.id },
    ...(post.slug ? [{ id: post.slug }] : []),
  ]);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = findPost(id);
  return { title: post?.title || "Conseils agricoles", description: post?.excerpt };
}

export default async function BlogPostPage({ params }) {
  const { id } = await params;
  const post = findPost(id);
  if (!post) notFound();

  const paragraphs = Array.isArray(post.body)
    ? post.body
    : [post.content || post.excerpt];
  const articleDetails = BLOG_ARTICLE_DETAILS[post.id];
  const otherPosts = BLOG_POSTS.filter((item) => item.id !== post.id).slice(0, 2);

  return (
    <main className="agri-editorial-page agri-article-page">
      <div className="agri-article-topline">
        <Link href="/blog"><ArrowLeft size={16} /> Retour au journal</Link>
        <span><BookOpen size={15} /> Édition numérique</span>
      </div>

      <article className="agri-article">
        <div className="agri-newspaper-masthead">
          <span>Agriculture · Élevage · Terroirs du Cameroun</span>
          <strong>Le Journal <em>AgriMarket</em></strong>
          <small>Le savoir du terrain, pour des récoltes qui comptent</small>
        </div>

        <header className="agri-article-header">
          <span className="agri-article-category"><Sprout size={14} />{categoryOf(post)}<i />Dossier agricole</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="agri-article-meta">
            <span className="agri-article-byline"><i><UserRound size={16} /></i><span>Par <strong>{post.author || "Équipe AgriMarket"}</strong></span></span>
            <span><CalendarDays size={15} />{formatDate(post.date)}</span>
            <span><Clock3 size={15} />{post.readTime || "5 min"} de lecture</span>
          </div>
        </header>

        <figure className="agri-article-cover-wrap">
          <img className="agri-article-cover" src={post.image} alt={post.title} />
          <figcaption><span>LE JOURNAL AGRIMARKET</span><span>{categoryOf(post)} · {formatDate(post.date)}</span></figcaption>
        </figure>

        <div className="agri-article-reading-layout">
          <div className="agri-article-body">
            <div className="agri-article-body-label"><span>À la une</span><i /></div>
            {articleDetails ? (
              <>
                <p>{articleDetails.introduction}</p>
                {articleDetails.sections.map((section) => (
                  <section className="agri-article-section" key={section.title}>
                    <h2>{section.title}</h2>
                    {section.paragraphs.map((text, index) => <p key={index}>{text}</p>)}
                  </section>
                ))}
              </>
            ) : paragraphs.map((text, index) => <p key={index}>{text}</p>)}

            <aside className="agri-article-callout">
              <Sprout size={24} />
              <div>
                <strong>À mettre en pratique</strong>
                <p>Retrouvez dans le catalogue AgriMarket des produits et équipements proposés par les vendeurs locaux.</p>
                <Link href="/catalogue">Explorer le catalogue <ArrowRight size={15} /></Link>
              </div>
            </aside>

            <div className="agri-article-footer-link"><Link href="/faq">Une question ? Consultez notre FAQ <ArrowRight size={15} /></Link></div>
            {articleDetails?.sources?.length > 0 && (
              <aside className="agri-article-sources">
                <h2>Pour aller plus loin</h2>
                <ul>
                  {articleDetails.sources.map((source) => (
                    <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowRight size={13} /></a></li>
                  ))}
                </ul>
                <p>Les pratiques sont à adapter à votre zone et aux recommandations des services agricoles ou vétérinaires locaux.</p>
              </aside>
            )}
          </div>

          <aside className="agri-article-sidebar">
            <span className="agri-editorial-eyebrow">En bref</span>
            <p>{post.excerpt}</p>
            <div><Clock3 size={15} /><span>{post.readTime || "5 min"} de lecture</span></div>
            <hr />
            <strong>Explorez le marché</strong>
            <p>Retrouvez les produits et équipements agricoles proposés près de chez vous.</p>
            <Link href="/catalogue">Voir le catalogue <ArrowRight size={15} /></Link>
          </aside>
        </div>
      </article>

      {otherPosts.length > 0 && (
        <section className="agri-article-related">
          <div className="agri-article-related-head"><div><span className="agri-editorial-eyebrow">Pour continuer</span><h2>À lire aussi</h2></div><Link href="/blog">Tous les articles <ArrowRight size={15} /></Link></div>
          <div className="agri-article-related-grid">
            {otherPosts.map((item) => (
              <Link href={`/blog/${item.id}`} key={item.id}>
                <img src={item.image} alt="" loading="lazy" />
                <div><span>{categoryOf(item)}</span><h3>{item.title}</h3><p>{item.excerpt}</p></div>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
