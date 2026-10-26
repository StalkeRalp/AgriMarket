import { MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { INFO_PAGES } from "@/lib/data/info";
const icons=[Sparkles,MapPinned,ShieldCheck];
export function InfoPage({type}){const info=INFO_PAGES[type];return <main><section className="page-hero"><div className="container"><p className="eyebrow">{info.kicker}</p><h1>{info.title}</h1><p>{info.lead}</p></div></section><section className="section container"><div className="info-feature-grid">{info.sections.map(([title,text],index)=>{const Icon=icons[index%icons.length];return <article className="info-feature" key={title}><span>{String(index+1).padStart(2,"0")}</span><Icon/><h2>{title}</h2><p>{text}</p></article>})}</div></section></main>}
