"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/context/StoreContext";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { validateData, getFieldError } from "@/lib/securite/validation-helper";
import { Lock, Eye, EyeOff, KeyRound, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams ? searchParams.get("token") : "";

  const { resetPassword } = useStore();

  const [form, setForm] = useState({
    token: queryToken || "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (queryToken) {
      setForm((prev) => ({ ...prev, token: queryToken }));
    }
  }, [queryToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setGeneralError("");
    setErrors({});
    setLoading(true);

    try {
      const validation = await validateData(resetPasswordSchema, form);
      if (!validation.success) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      resetPassword(validation.data.token, validation.data.password);
      setSuccess(true);
    } catch (err) {
      setGeneralError(err.message || "Erreur lors de la réinitialisation.");
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
            <img src="/logo/AgriMarket_logo.png" alt="AgriMarket" className="auth-exact-logo-icon" />
            <div className="auth-exact-logo-text">
              <span className="auth-exact-brand">AgriMarket</span>
              <small className="auth-exact-subbrand">Du champ à votre table</small>
            </div>
          </Link>

          {/* Title */}
          <h1 className="auth-exact-heading">Nouveau mot de passe</h1>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#8c7798", marginTop: "-18px", marginBottom: "20px", maxWidth: "380px" }}>
            Définissez votre nouveau mot de passe sécurisé.
          </p>

          {generalError && (
            <div className="auth-exact-error" role="alert">
              <span>{generalError}</span>
            </div>
          )}

          {success ? (
            <div className="auth-success-pill-box" style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
              <CheckCircle2 width={44} style={{ color: "#22c55e", margin: "0 auto 10px auto" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#3b2042", margin: "0 0 6px 0" }}>Mot de passe modifié !</h3>
              <p style={{ fontSize: "13px", color: "#8c7798", marginBottom: "16px" }}>Votre mot de passe a été mis à jour avec succès.</p>
              
              <Link 
                href="/connexion" 
                className="auth-exact-pink-btn"
              >
                Se connecter <ArrowRight width={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-exact-form" noValidate>
              <div className="auth-exact-field">
                <label htmlFor="token-input">Code de réinitialisation</label>
                <div className="auth-exact-input-box">
                  <KeyRound className="field-icon-svg" />
                  <input
                    id="token-input"
                    type="text"
                    name="token"
                    value={form.token}
                    onChange={handleInputChange}
                    placeholder="RST-XXXX"
                    className={getFieldError(errors, "token") ? "input-error" : ""}
                    required
                  />
                </div>
                {getFieldError(errors, "token") && (
                  <span className="field-error-msg">{getFieldError(errors, "token")}</span>
                )}
              </div>

              <div className="auth-exact-field">
                <label htmlFor="password-input">Nouveau mot de passe</label>
                <div className="auth-exact-input-box">
                  <Lock className="field-icon-svg" />
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Saisissez votre nouveau mot de passe"
                    className={getFieldError(errors, "password") ? "input-error" : ""}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Afficher ou masquer le mot de passe"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {getFieldError(errors, "password") && (
                  <span className="field-error-msg">{getFieldError(errors, "password")}</span>
                )}
              </div>

              <div className="auth-exact-field">
                <label htmlFor="confirmPassword-input">Confirmer le nouveau mot de passe</label>
                <div className="auth-exact-input-box">
                  <Lock className="field-icon-svg" />
                  <input
                    id="confirmPassword-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Saisissez à nouveau le mot de passe"
                    className={getFieldError(errors, "confirmPassword") ? "input-error" : ""}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Afficher ou masquer la confirmation"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {getFieldError(errors, "confirmPassword") && (
                  <span className="field-error-msg">{getFieldError(errors, "confirmPassword")}</span>
                )}
              </div>

              <button type="submit" className="auth-exact-pink-btn" disabled={loading}>
                {loading ? (
                  <span>Mise à jour...</span>
                ) : (
                  <>
                    <span>Valider mon nouveau mot de passe</span> <ArrowRight width={16} />
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
          <img src="/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg" alt="Production agricole locale" className="auth-exact-img" />
        </div>
      </div>
    </main>
  );
}
