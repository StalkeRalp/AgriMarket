"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/context/StoreContext";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { validateData, getFieldError } from "@/lib/securite/validation-helper";
import { readableError } from "@/lib/utils/readable-error";
import { Mail, ArrowRight, CheckCircle2, KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useStore();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setGeneralError("");
    setErrors({});
    setLoading(true);

    try {
      const validation = await validateData(forgotPasswordSchema, { email });
      if (!validation.success) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      const res = requestPasswordReset(validation.data.email);
      setResetSent(res);
    } catch (err) {
      setGeneralError(readableError(err, "Nous n’avons pas pu traiter votre demande. Vérifiez votre connexion puis réessayez."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-exact-page">
      <div className="auth-exact-split">
        {/* Left Form Column */}
        <div className="auth-exact-form-side">
          {/* Subtle Ambient Background Bubbles */}
          <div className="auth-bubble-ambient bubble-1" />
          <div className="auth-bubble-ambient bubble-2" />
          <div className="auth-bubble-ambient bubble-3" />
          <div className="auth-bubble-ambient bubble-4" />

          {/* Logo Header (Enlarged & Centered) */}
          <Link href="/" className="auth-exact-logo">
            <img src="/logo/logo1.png" alt="AgriMarket — Du champ à votre table" className="auth-exact-logo-icon" />
            <div className="auth-exact-logo-text">
              <span className="auth-exact-brand">AgriMarket</span>
              <small className="auth-exact-subbrand">Du champ à votre table</small>
            </div>
          </Link>

          {/* Title */}
          <h1 className="auth-exact-heading">Mot de passe oublié</h1>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#8c7798", marginTop: "-18px", marginBottom: "20px", maxWidth: "380px" }}>
            Saisissez votre e-mail pour recevoir les instructions de réinitialisation.
          </p>

          {generalError && (
            <div className="auth-exact-error" role="alert">
              <span>{generalError}</span>
            </div>
          )}

          {resetSent ? (
            <div className="auth-success-pill-box" style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
              <CheckCircle2 width={44} style={{ color: "#22c55e", margin: "0 auto 10px auto" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#3b2042", margin: "0 0 6px 0" }}>Instructions envoyées !</h3>
              <p style={{ fontSize: "13px", color: "#8c7798", marginBottom: "12px" }}>
                Un e-mail de réinitialisation a été transmis à <strong>{email}</strong>.
              </p>
              
             
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link 
                  href={`/reinitialisation-mot-de-passe?token=${resetSent.token}`} 
                  className="auth-exact-pink-btn"
                >
                  <KeyRound width={16} /> Réinitialiser mon mot de passe
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-exact-form" noValidate>
              <div className="auth-exact-field">
                <label htmlFor="email-input">Email</label>
                <div className="auth-exact-input-box">
                  <Mail className="field-icon-svg" />
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                placeholder="exemple@domaine.com"
                    className={getFieldError(errors, "email") ? "input-error" : ""}
                    required
                  />
                </div>
                {getFieldError(errors, "email") && (
                  <span className="field-error-msg">{getFieldError(errors, "email")}</span>
                )}
              </div>

              <button type="submit" className="auth-exact-pink-btn" disabled={loading}>
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <span>Envoyer les instructions</span> <ArrowRight width={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="auth-exact-footer" style={{ marginTop: "20px" }}>
            <Link href="/connexion" className="auth-exact-purple-link">
              <ArrowLeft width={14} /> Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="auth-exact-image-side">
          <img src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="Récoltes locales sur un marché camerounais" className="auth-exact-img" />
          <div className="auth-exact-image-message">
            <span>VOTRE ESPACE AGRIMARKET</span>
            <h2>Retrouvez votre accès, en toute simplicité.</h2>
            <p>Nous vous guidons pour reprendre le fil de vos achats. Votre marché vous attend.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
