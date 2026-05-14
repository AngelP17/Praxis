import { proxyBackend } from "@/app/api/_lib/praxis-server";

const CSV = [
  "tab,metric,value",
  "Executive Summary,Total Tickets,10",
  "Executive Summary,Open Queue,7",
  "Executive Summary,Critical Tickets,1",
  "Operational Queue,Primary Incident,INC-4821",
  "Decision Intelligence,Confidence,0.92",
].join("\n");

export async function GET() {
  return proxyBackend("/api/reports/excel", undefined, () =>
    new Response(CSV, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="praxis_report_demo.csv"',
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }),
  );
}
