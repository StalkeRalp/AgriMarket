"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/context/StoreContext";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { validateData, getFieldError } from "@/lib/securite/validation-helper";
import { errorHandler } from "@/lib/securite/error-handler";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight } from "lucide-react";

export function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get("redirect") : null;
  const { user, hydrated, login, register, setUsers, setUser, notify } = useStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && user) {
      router.push("/");
    }
  }, [user, hydrated, router]);

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
      if (mode === "login") {
        const validation = await validateData(loginSchema, {
          email: form.email,
          password: form.password,
        });

        if (!validation.success) {
          setErrors(validation.errors);
          setLoading(false);
          return;
        }

        const result = login(validation.data.email, validation.data.password);
        if (!result) {
          setGeneralError("Identifiants incorrects. Vérifiez votre adresse e-mail et votre mot de passe.");
          setLoading(false);
          return;
        }

        router.push("/");
      } else {
        const validation = await validateData(registerSchema, {
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });

        if (!validation.success) {
          setErrors(validation.errors);
          setLoading(false);
          return;
        }

        const nameParts = (validation.data.name || "").trim().split(" ");
        const firstName = nameParts[0] || "Client";
        const lastName = nameParts.slice(1).join(" ") || "";

        const registerResult = register({
          email: validation.data.email,
          password: validation.data.password,
          firstName,
          lastName,
          name: validation.data.name,
        });

        router.push(`/verification-otp?email=${encodeURIComponent(validation.data.email)}&code=${registerResult.otpCode}`);
      }
    } catch (err) {
      const errorResponse = errorHandler.handle(err, {
        action: mode === "login" ? "login" : "register",
      });
      setGeneralError(errorResponse.error.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Social Login Handler (Google & Facebook)
  const handleSocialLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      const socialUser = {
        id: `u-social-${Date.now()}`,
        firstName: provider === "Google" ? "Compte" : "Membre",
        lastName: provider,
        email: `${provider.toLowerCase()}.user@itexal.com`,
        role: "CLIENT",
      };

      setUsers(current => {
        if (current.some(u => u.email === socialUser.email)) return current;
        return [...current, socialUser];
      });

      setUser(socialUser);
      notify(`Connexion réussie via ${provider} !`);
      setLoading(false);
      router.push("/");
    }, 400);
  };

  // Agricultural marketplace brand assets
  const bgPhoto = mode === "login"
    ? "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg"
    : "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg";

  return (
    <main className="auth-exact-page">
      <div className="auth-exact-split">
        {/* Left Form Column */}
        <div className="auth-exact-form-side">
          {/* Subtle Ambient Background Bubbles */}
          <div className="auth-bubble-ambient bubble-1" />
          <div className="auth-bubble-ambient bubble-2" />
          <div className="auth-bubble-ambient bubble-3" />

          {/* Logo Header (Enlarged & Centered) */}
          <Link href="/" className="auth-exact-logo">
            <img src="/logo/AgriMarket_logo.png" alt="AgriMarket" className="auth-exact-logo-icon" />
            <div className="auth-exact-logo-text">
              <span className="auth-exact-brand">AgriMarket</span>
              <small className="auth-exact-subbrand">Du champ à votre table</small>
            </div>
          </Link>

          {/* Centered Title */}
          <h1 className="auth-exact-heading">
            {mode === "login" ? "Ravi de vous retrouver" : "Rejoignez AgriMarket"}
          </h1>

          {generalError && (
            <div className="auth-exact-error" role="alert">
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-exact-form" noValidate>
            {mode === "register" && (
              <div className="auth-exact-field">
                <label htmlFor="name-input">Nom complet</label>
                <div className="auth-exact-input-box">
                  <UserIcon className="field-icon-svg" />
                  <input
                    id="name-input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Saisissez votre nom"
                    className={getFieldError(errors, "name") ? "input-error" : ""}
                    required
                  />
                </div>
                {getFieldError(errors, "name") && (
                  <span className="field-error-msg">{getFieldError(errors, "name")}</span>
                )}
              </div>
            )}

            <div className="auth-exact-field">
              <label htmlFor="email-input">Adresse e-mail</label>
              <div className="auth-exact-input-box">
                <Mail className="field-icon-svg" />
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="exemple@domaine.com"
                  className={getFieldError(errors, "email") ? "input-error" : ""}
                  required
                />
              </div>
              {getFieldError(errors, "email") && (
                <span className="field-error-msg">{getFieldError(errors, "email")}</span>
              )}
            </div>

            <div className="auth-exact-field">
              <div className="label-flex-row">
                <label htmlFor="password-input">Mot de passe</label>
                {mode === "login" && (
                  <Link href="/mot-de-passe-oublie" className="forgot-pwd-link">
                    Mot de passe oublié ?
                  </Link>
                )}
              </div>
              <div className="auth-exact-input-box">
                <Lock className="field-icon-svg" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Saisissez votre mot de passe"
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

            {mode === "register" && (
              <div className="auth-exact-field">
                <label htmlFor="confirmPassword-input">Confirmer le mot de passe</label>
                <div className="auth-exact-input-box">
                  <Lock className="field-icon-svg" />
                  <input
                    id="confirmPassword-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Saisissez à nouveau votre mot de passe"
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
            )}

            <button type="submit" className="auth-exact-pink-btn" disabled={loading}>
              {loading ? (
                <span>Veuillez patienter…</span>
              ) : mode === "login" ? (
                <>
                  <span>Se connecter</span> <ArrowRight width={16} />
                </>
              ) : (
                <>
                  <span>Créer mon compte</span> <ArrowRight width={16} />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Section (Google & Facebook Buttons) */}
          <div className="auth-exact-social-divider">
            <span>ou continuer avec</span>
          </div>

          <div className="auth-exact-social-grid">
            <button
              type="button"
              className="auth-exact-social-btn"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="auth-exact-social-btn"
              onClick={() => handleSocialLogin("Facebook")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Footer Link */}
          <div className="auth-exact-footer">
            {mode === "login" ? (
              <p>
                Pas encore de compte ?{" "}
                <Link href="/inscription" className="auth-exact-purple-link">
                  S’inscrire <ArrowRight width={14} />
                </Link>
              </p>
            ) : (
              <p>
                Vous avez déjà un compte ?{" "}
                <Link href="/connexion" className="auth-exact-purple-link">
                  Se connecter <ArrowRight width={14} />
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Right Side Image */}
        <div className="auth-exact-image-side">
          <img src={bgPhoto} alt="AgriMarket marketplace agricole" className="auth-exact-img" />
        </div>
      </div>
    </main>
  );
}
