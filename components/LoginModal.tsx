"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  title?: string;
  subtitle?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  redirectUrl = "/",
  title = "Login Required",
  subtitle = "Please login to continue browsing properties",
}: LoginModalProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!emailOrPhone.trim()) {
      setError("Please enter your email or phone number");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn(emailOrPhone, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    onClose();
    router.push(redirectUrl);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="login-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="login-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <button className="login-modal-close" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>

            <div className="login-modal-header">
              <Link href="/" className="login-modal-logo">
                <Image
                  src="/logo2.png"
                  alt="Ghardaar24"
                  width={140}
                  height={56}
                  className="login-modal-logo-img"
                />
              </Link>
              <h2 className="login-modal-title">{title}</h2>
              <p className="login-modal-subtitle">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-modal-form">
              <div className="login-modal-input-group">
                <label htmlFor="modal-emailOrPhone">
                  Email or Phone Number
                </label>
                <div className="login-modal-input-wrapper">
                  <Mail className="login-modal-input-icon" />
                  <input
                    id="modal-emailOrPhone"
                    type="text"
                    placeholder="Enter email or phone number"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="login-modal-input"
                    disabled={loading}
                  />
                </div>
                <span className="login-modal-input-hint">
                  <Phone className="w-3 h-3" />
                  You can login with your registered phone number
                </span>
              </div>

              <div className="login-modal-input-group">
                <label htmlFor="modal-password">Password</label>
                <div className="login-modal-input-wrapper">
                  <Lock className="login-modal-input-icon" />
                  <input
                    id="modal-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-modal-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-modal-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  className="login-modal-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="login-modal-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="login-modal-loading">Signing in...</span>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="login-modal-footer-text">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="login-modal-link">
                  Sign up here
                </Link>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
