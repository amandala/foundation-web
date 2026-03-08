import styles from "./page.module.scss";

export default function Loading() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingSpinner} />
    </div>
  );
}
