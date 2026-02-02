"use client";

import { useEffect } from "react";
import styles from "./Toast.module.scss";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <div className={styles.icon}>
          {type === "success" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className={styles.message}>{message}</span>
      </div>
      <button className={styles.closeButton} onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
