import styles from "./styles.module.scss";

export const PageHeader = ({ title }: { title: string }) => (
  <div className={styles.headerWrapper}>
    <h1 className={styles.headerText}>{title}</h1>
  </div>
);
