"use client";

import { BadgeCheck, CircleX, Store } from "lucide-react";
import { useStore } from "@/lib/store";

export function AdminSection({ section }) {
  const { user, users, setUsers, notify } = useStore();

  if (!user || user.role !== "ADMIN") {
    return <div>Accès refusé</div>;
  }

  if (section === "vendeurs") {
    const applicants = users.filter(item => item.isSeller && item.sellerStatus === "pending");
    const decide = (applicant, status) => {
      setUsers(current => current.map(item => item.id === applicant.id ? { ...item, sellerStatus: status, sellerReviewedAt: new Date().toISOString() } : item));
      notify(status === "active" ? "Boutique validée. Le vendeur peut publier ses produits." : "Demande vendeur refusée.");
    };
    return <div className="admin-section"><header className="admin-heading"><div><p className="eyebrow">CONTRÔLE DES COMPTES</p><h1>Validation des boutiques</h1></div><p>Examinez les informations avant d’autoriser la publication des produits.</p></header>{applicants.length ? <div className="admin-panel">{applicants.map(applicant => <article key={applicant.id} style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",padding:"18px 0",borderBottom:"1px solid #e5ece7"}}><div><strong>{applicant.sellerProfile?.shopName || applicant.name || "Boutique sans nom"}</strong><p style={{margin:"6px 0",color:"#66756b"}}>{[applicant.sellerProfile?.city,applicant.sellerProfile?.region].filter(Boolean).join(", ")} · {applicant.sellerProfile?.phone || applicant.phone}</p><small>{applicant.sellerProfile?.description || "Aucune description fournie."}</small></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="mypage-primary" onClick={()=>decide(applicant,"active")}><BadgeCheck size={16}/> Valider</button><button className="mypage-secondary is-danger" onClick={()=>decide(applicant,"rejected")}><CircleX size={16}/> Refuser</button></div></article>)}</div> : <div className="admin-panel admin-empty"><Store/><p>Aucune demande de boutique en attente.</p></div>}</div>;
  }

  return (
    <div className="admin-section">
      <h2>{section}</h2>
      <p>Contenu du formulaire pour {section}</p>
    </div>
  );
}

export default AdminSection;
