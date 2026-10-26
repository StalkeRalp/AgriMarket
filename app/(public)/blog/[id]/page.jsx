import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/data/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ id: post.id }));
}

export default async function BlogPostPage({ params }) {
  const { id } = await params;
  const post = BLOG_POSTS.find(item => item.id === id);
  if (!post) notFound();

  const paragraphs = Array.isArray(post.body) 
    ? post.body 
    : [post.content || post.excerpt];

  const categoryName = post.category || "Conseils Agricoles";

  return (
    <main className="section container">
      <article className="article">
        <header>
          <p className="eyebrow">{categoryName} · {post.readTime || "5 min"}</p>
          <h1>{post.title}</h1>
          <p className="article-lead">{post.excerpt}</p>
        </header>

        <img className="article-hero" src={post.image} alt={post.title} />

        <div className="article-body">
          {paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}

          <div className="article-callout">
            <p>Retrouvez les semences certifiées, engrais et équipements adaptés pour vos parcelles dans notre catalogue.</p>
          </div>

          <Link className="btn btn-dark" href="/catalogue">
            Explorer le catalogue agropastoral
          </Link>
        </div>
      </article>
    </main>
  );
}
