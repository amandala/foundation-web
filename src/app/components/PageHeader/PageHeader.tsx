import Image from "next/image";
import styles from "./styles.module.scss";

type Props = {
  title: string;
  /** Path to an image in the Next.js public directory, e.g. "/events.png". */
  imageSrc?: string;
  size?: "large" | "small";
};

export const PageHeader = ({ title, imageSrc, size = "large" }: Props) => (
  <div className={styles.headerWrapper}>
    {imageSrc ? (
      <div
        className={`${styles.headerImage} ${
          size === "small" ? styles.headerImageSmall : ""
        }`}
      >
        <Image
          src={imageSrc}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
    ) : (
      <h1
        className={styles.headerText}
        style={size === "small" ? { fontSize: "min(4vw, 4rem)" } : undefined}
      >
        {title}
      </h1>
    )}
  </div>
);
