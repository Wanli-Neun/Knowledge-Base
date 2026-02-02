import type { ReactNode } from "react";
import styles from "./layout.module.scss";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.brand}>Knowledge Base</div>
        <section className={styles.card}>{children}</section>
      </div>
    </main>
  );
}
