"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./login.module.scss";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";

type LoginValues = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

type SignUpValues = {
  email: string;
  password: string;
  fullName: string;
  displayName: string;
};

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loginValues, setLoginValues] = useState<LoginValues>({
    identifier: "",
    password: "",
    rememberMe: true,
  });
  
  const [signupValues, setSignupValues] = useState<SignUpValues>({
    email: "",
    password: "",
    fullName: "",
    displayName: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // validate tối thiểu
    if (!loginValues.identifier.trim()) return setError("Please enter email");
    if (!loginValues.password.trim()) return setError("Please enter password");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginValues.identifier,      // BE đang nhận email
          password: loginValues.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Login failed");
      }

      // data.accessToken có ở đây
      console.log("accessToken:", data.accessToken);

      // TODO bước sau: redirect sang trang chính (vd /dashboard)
      router.replace("/dashboard");

    } catch (err: any) {
      setError(err?.message ?? "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!signupValues.email.trim()) return setError("Please enter email");
    if (!signupValues.password.trim()) return setError("Please enter password");
    if (!signupValues.fullName.trim()) return setError("Please enter full name");
    if (!signupValues.displayName.trim()) return setError("Please enter display name");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupValues),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Sign up failed");
      }

      // After successful signup, clear form and switch to signin
      setSignupValues({
        email: "",
        password: "",
        fullName: "",
        displayName: "",
      });
      setSuccess("Sign up successful! Please sign in.");
      setMode('signin');
      setError(null);

    } catch (err: any) {
      setError(err?.message ?? "Sign up failed. Please try again.");
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${mode === 'signin' ? styles.active : ''}`}
          onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
        >
          Sign in
        </button>
        <button 
          className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`}
          onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
        >
          Sign up
        </button>
      </div>

      <p className={styles.subtitle}>
        {mode === 'signin' ? 'Enter your account to continue.' : 'Create a new account to get started.'}
      </p>

      {mode === 'signin' ? (
        <form className={styles.form} onSubmit={onLogin}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="identifier">
              Email / Username
            </label>
            <input
              id="identifier"
              className={styles.input}
              value={loginValues.identifier}
              onChange={(e) => setLoginValues((s) => ({ ...s, identifier: e.target.value }))}
              autoComplete="username"
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={loginValues.password}
              onChange={(e) => setLoginValues((s) => ({ ...s, password: e.target.value }))}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <div className={styles.helperRow}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={loginValues.rememberMe}
                onChange={(e) => setLoginValues((s) => ({ ...s, rememberMe: e.target.checked }))}
              />
              Remember me
            </label>

            <Link className={styles.link} href="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={onSignup}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              className={styles.input}
              type="email"
              value={signupValues.email}
              onChange={(e) => setSignupValues((s) => ({ ...s, email: e.target.value }))}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              className={styles.input}
              type="password"
              value={signupValues.password}
              onChange={(e) => setSignupValues((s) => ({ ...s, password: e.target.value }))}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              className={styles.input}
              value={signupValues.fullName}
              onChange={(e) => setSignupValues((s) => ({ ...s, fullName: e.target.value }))}
              autoComplete="name"
              placeholder="John Doe"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="displayName">
              Display Name
            </label>
            <input
              id="displayName"
              className={styles.input}
              value={signupValues.displayName}
              onChange={(e) => setSignupValues((s) => ({ ...s, displayName: e.target.value }))}
              placeholder="Johnny"
            />
          </div>

          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>
      )}

      {/* Toast Notifications */}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}
    </div>
  );
}
