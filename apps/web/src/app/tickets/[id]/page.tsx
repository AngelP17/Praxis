import { TicketWorkspace } from "@/components/ticket-workspace";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketWorkspace ticketId={id} />;
}
