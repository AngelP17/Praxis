import { redirect } from "next/navigation";

export default function FieldLabPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pack = typeof searchParams.pack === "string" ? searchParams.pack : "";
  redirect(`/field-workbench${pack ? `?pack=${pack}` : ""}`);
}
