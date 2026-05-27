import { redirect } from "next/navigation";

export default async function FieldLabPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const pack = typeof resolvedSearchParams.pack === "string" ? resolvedSearchParams.pack : "";
  redirect(`/field-workbench${pack ? `?pack=${pack}` : ""}`);
}
