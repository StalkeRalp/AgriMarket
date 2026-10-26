"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/context/StoreContext";
import { ShieldCheck, RefreshCw, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams ? searchParams.get("email") : "";
  const codeParam = searchParams ? searchParams.get("code") : "";

  const { pendingVerification, verifyOtp, sendOtp } = useStore();

  const email = emailParam || (pendingVerification ? pendingVerification.email : "");
  const demoCode = codeParam || (pendingVerification ? pendingVerification.otpCode : "");

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (demoCode && demoCode.length === 6) {
      setDigits(demoCode.split(""));
    }
  }, [demoCode]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleDigitChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^[0-9]$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^[0-9]{6}$/.test(pasteData)) {
      setDigits(pasteData.split(""));
      setError("");
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = digits.join("");
    if (fullCode.length < 6) {
      setError("Veuillez saisir l'intégralité du code OTP à 6 chiffres.");
      return;
    }

    if (loading) return;
    setError("");
    setLoading(true);

    try {
      verifyOtp(email, fullCode);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Code OTP invalide.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    try {
      const newCode = sendOtp(email);
      setTimer(60);
      setCanResend(false);
      setError("");
      if (newCode) {
        setDigits(newCode.split(""));
      }
    } catch (err) {
      setError(err.message || "Erreur lors du renvoi du code.");
    }
  };

  return (
    <main className="auth-exact-page">
      <div className="auth-exact-split">
        {/* Left Form Column */}
        <div className="auth-exact-form-side">
          {/* Subtle Pink Ambient Background Bubbles */}
          <div className="auth-bubble-ambient bubble-1" />
          <div className="auth-bubble-ambient bubble-2" />
          <div className="auth-bubble-ambient bubble-3" />
          <div className="auth-bubble-ambient bubble-4" />

          {/* Logo Header (Enlarged & Centered) */}
          <Link href="/" className="auth-exact-logo">
            <img src="/logo/AgriMarket_logo.png" alt="AgriMarket" className="auth-exact-logo-icon" />
            <div className="auth-exact-logo-text">
              <span className="auth-exact-brand">AgriMarket</span>
              <small className="auth-exact-subbrand">Marketplace</small>
            </div>
          </Link>

          {/* Title */}
          <h1 className="auth-exact-heading">Verify Code</h1>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#8c7798", marginTop: "-18px", marginBottom: "20px", maxWidth: "380px" }}>
            Code de confirmation envoyé à <strong>{email || "votre adresse e-mail"}</strong>.
          </p>

          {demoCode && (
            <div className="auth-otp-demo-badge-pill" style={{ marginBottom: "16px", alignSelf: "center" }}>
              <ShieldCheck width={16} /> Code de démo : <strong>{demoCode}</strong>
            </div>
          )}

          {error && (
            <div className="auth-exact-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="auth-success-pill-box" style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
              <CheckCircle2 width={44} style={{ color: "#22c55e", margin: "0 auto 10px auto" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#3b2042", margin: "0 0 6px 0" }}>Vérification Réussie !</h3>
              <p style={{ fontSize: "13px", color: "#8c7798", margin: 0 }}>Redirection vers votre espace compte...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="auth-exact-form" noValidate>
              <div className="otp-pill-inputs-grid" onPaste={handlePaste} style={{ display: "flex", gap: "8px", justifyContent: "center", margin: "8px 0 16px 0" }}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="auth-exact-otp-digit"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <button type="submit" className="auth-exact-pink-btn" disabled={loading}>
                {loading ? (
                  <span>Vérification...</span>
                ) : (
                  <>
                    <span>Valider mon code</span> <ArrowRight width={16} />
                  </>
                )}
              </button>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", marginTop: "14px", fontSize: "12px", color: "#8c7798" }}>
                <span>Vous n'avez pas reçu le code ?</span>
                {canResend ? (
                  <button type="button" onClick={handleResendOtp} style={{ background: "none", border: "none", color: "#4a2e58", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <RefreshCw width={14} /> Renvoyer le code
                  </button>
                ) : (
                  <span>Renvoyer dans <strong>{timer}s</strong></span>
                )}
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="auth-exact-footer" style={{ marginTop: "18px" }}>
            <Link href="/connexion" className="auth-exact-purple-link">
              <ArrowLeft width={14} /> Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="auth-exact-image-side">
          <img src="/Images/pexels-nguy-n-van-to-n-485495995-15916401.jpg" alt="AgriMarket marketplace agricole" className="auth-exact-img" />
        </div>
      </div>
    </main>
  );
}
