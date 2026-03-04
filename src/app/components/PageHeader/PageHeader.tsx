import styles from "./styles.module.scss";

type Props = {
  title: string;
  size?: "large" | "small";
};

export const PageHeader = ({ title, size = "large" }: Props) => (
  <div className={styles.headerWrapper}>
    <h1
      className={styles.headerText}
      style={size === "small" ? { fontSize: "min(4vw, 4rem)" } : undefined}
    >
      {title}
    </h1>
  </div>
);
