import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "4qydhzw9",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});
