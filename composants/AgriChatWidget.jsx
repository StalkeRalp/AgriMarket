"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Check, Copy, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { useStore } from "@/lib/store";

const quickQuestions = ["Comment passer une commande ?", "Quels moyens de paiement sont proposés ?"];

function renderInline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part,index)=>part.startsWith("**") && part.endsWith("**")
    ? <strong key={`${keyPrefix}-${index}`}>{part.slice(2,-2)}</strong>
    : <span key={`${keyPrefix}-${index}`}>{part.replace(/\*\*/g,"")}</span>);
}

function ChatAnswer({ content }) {
  const lines = String(content || "").split(/\n+/).map(line=>line.trim()).filter(Boolean);
  return <div className="agri-chat-answer">{lines.map((line,index)=>{
    const numbered = line.match(/^(\d+)[.)]\s*(.*)$/);
    const bullet = line.match(/^[-*•]\s*(.*)$/);
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (numbered) return <div className="agri-chat-answer-step" key={index}><span>{numbered[1].padStart(2,"0")}</span><p>{renderInline(numbered[2],`step-${index}`)}</p></div>;
    if (bullet) return <div className="agri-chat-answer-bullet" key={index}><span aria-hidden="true">•</span><p>{renderInline(bullet[1],`bullet-${index}`)}</p></div>;
    if (heading) return <strong className="agri-chat-answer-heading" key={index}>{renderInline(heading[1],`heading-${index}`)}</strong>;
    return <p key={index}>{renderInline(line,`line-${index}`)}</p>;
  })}</div>;
}

export default function AgriChatWidget() {
  const { products } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [failedMessage, setFailedMessage] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    inputRef.current?.focus();
  }, [open, messages, sending]);

  const sendMessage = async (event, preset = "", retry = false) => {
    event?.preventDefault();
    const content = (preset || input).trim();
    if (!content || sending) return;
    const nextMessages = retry ? messages : [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setFailedMessage("");
    setSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          catalog: (products || []).filter(product => !["archived", "suspended", "pending", "draft"].includes(String(product.status || "").toLowerCase())).slice(0, 80).map(product => ({
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price,
            unit: product.unit,
            stock: product.stock,
            location: product.location || product.city,
            brand: product.brand || product.sellerName,
            saleMode: product.saleMode,
            discountPercent: product.discountPercent,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Une erreur est survenue.");
      setMessages(current => [...current, { role: "assistant", content: data.reply }]);
    } catch (sendError) {
      setError(sendError.message || "Votre message n’a pas pu être envoyé.");
      setFailedMessage(content);
    } finally {
      setSending(false);
    }
  };

  const retryLastMessage = () => {
    if (!failedMessage || sending) return;
    sendMessage(null,failedMessage,true);
  };

  const copyAnswer = async (content,index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      window.setTimeout(()=>setCopiedIndex(current=>current===index?null:current),1800);
    } catch {
      setError("La copie n’est pas disponible dans ce navigateur.");
    }
  };

  return <div className="agri-chat-widget">
    {open && <section className="agri-chat-panel" aria-label="Assistant AgriMarket" aria-modal="false" role="dialog">
      <header className="agri-chat-header"><span className="agri-chat-avatar"><img src="/logo/logo.png" alt="Logo AgriMarket"/></span><div><strong>Assistant AgriMarket</strong><small>Votre aide pour acheter et vendre</small></div><button type="button" onClick={()=>setOpen(false)} aria-label="Fermer le chat"><X size={21}/></button></header>
      <div className="agri-chat-messages" ref={logRef} aria-live="polite">
        {!messages.length && <div className="agri-chat-welcome"><span><Bot size={22}/></span><strong>Bonjour ! Comment puis-je vous aider ?</strong><p>Posez une question sur les commandes, les paiements, la livraison ou votre boutique.</p><div>{quickQuestions.map(question=><button key={question} type="button" onClick={event=>sendMessage(event,question)} disabled={sending}>{question}</button>)}</div></div>}
        {messages.map((message,index)=><div className={`agri-chat-message is-${message.role}`} key={`${index}-${message.role}`}>{message.role==="assistant" ? <><ChatAnswer content={message.content}/><button type="button" className="agri-chat-message-action" onClick={()=>copyAnswer(message.content,index)} aria-label={copiedIndex===index?"Réponse copiée":"Copier la réponse"} title={copiedIndex===index?"Copié":"Copier la réponse"}>{copiedIndex===index?<Check size={15}/>:<Copy size={15}/>}<span>{copiedIndex===index?"Copié":"Copier"}</span></button></> : <p>{message.content}</p>}</div>)}
        {sending && <p className="agri-chat-message is-assistant agri-chat-typing">L’assistant prépare une réponse…</p>}
        {error && <div className="agri-chat-error" role="alert"><span>{error}</span>{failedMessage && <button type="button" onClick={retryLastMessage} disabled={sending}><RotateCcw size={15}/> Réessayer</button>}</div>}
      </div>
      <form className="agri-chat-form" onSubmit={sendMessage}><input ref={inputRef} value={input} onChange={event=>setInput(event.target.value)} placeholder="Écrivez votre question…" aria-label="Votre message" maxLength={1000} disabled={sending}/><button type="submit" aria-label="Envoyer le message" disabled={sending || !input.trim()}><Send size={17}/></button></form>
      <p className="agri-chat-footnote">Évitez d’envoyer des informations sensibles.</p>
    </section>}
    <button type="button" className={`agri-chat-launcher${open ? " is-open" : ""}`} onClick={()=>setOpen(value=>!value)} aria-label={open ? "Fermer l’assistant" : "Ouvrir l’assistant AgriMarket"} aria-expanded={open}><span>{open ? <X size={22}/> : <MessageCircle size={22}/>}</span>{!open && <span className="agri-chat-launcher-label">Besoin d’aide ?</span>}</button>
  </div>;
}
