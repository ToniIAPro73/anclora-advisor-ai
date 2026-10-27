import { SESSION_COOKIE_NAME } from "../../src/lib/auth/constants";

function assert(condition: boolean, label: string): void {
  if (!condition) {
    throw new Error(`E2E assertion failed: ${label}`);
  }
  console.log(`OK  ${label}`);
}

function getBaseUrl(): string {
  return process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
}

async function main(): Promise<void> {
  console.log("=== Authenticated E2E Check ===");

  const baseUrl = getBaseUrl();
  const identityCookie = process.env.E2E_SESSION_COOKIE;
  if (!identityCookie) throw new Error("Set E2E_SESSION_COOKIE from a dedicated Anclora Identity QA account");
  const cookieHeader = `${SESSION_COOKIE_NAME}=${identityCookie}`;


    const dashboardResponse = await fetch(`${baseUrl}/dashboard/chat`, {
      headers: { Cookie: cookieHeader },
    });
    assert(dashboardResponse.ok, "dashboard chat is reachable with session cookie");
    const dashboardHtml = await dashboardResponse.text();
    assert(dashboardHtml.includes("Workspace Conversacional"), "dashboard chat renders expected workspace");

    const fiscalResponse = await fetch(`${baseUrl}/api/fiscal-alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        alertType: "iva",
        description: "Alerta fiscal E2E",
        dueDate: "2026-04-20",
        priority: "high",
        workflowStatus: "prepared",
      }),
    });
    const fiscalResult = await fiscalResponse.json() as { success?: boolean; alert?: { id?: string } };
    assert(fiscalResponse.ok && fiscalResult.success && Boolean(fiscalResult.alert?.id), "fiscal alert can be created through authenticated API");

    const laborResponse = await fetch(`${baseUrl}/api/labor-risk-assessments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        scenarioDescription: "Escenario E2E de pluriactividad con mitigacion operativa",
        riskScore: 0.61,
        riskLevel: "high",
        recommendations: ["Separar actividades", "Revisar contrato"],
      }),
    });
    const laborResult = await laborResponse.json() as { success?: boolean; assessment?: { id?: string } };
    assert(laborResponse.ok && laborResult.success && Boolean(laborResult.assessment?.id), "labor assessment can be created through authenticated API");

    const invoiceResponse = await fetch(`${baseUrl}/api/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        clientName: "Cliente E2E SL",
        clientNif: "B12345678",
        amountBase: 1000,
        ivaRate: 21,
        irpfRetention: 15,
        issueDate: "2026-03-01",
        series: "E2E",
        recipientEmail: "cliente.e2e@example.com",
      }),
    });
    const invoiceResult = await invoiceResponse.json() as { success?: boolean; invoice?: { id?: string } };
    assert(invoiceResponse.ok && invoiceResult.success && Boolean(invoiceResult.invoice?.id), "invoice draft can be created through authenticated API");

    const filteredInvoiceResponse = await fetch(`${baseUrl}/api/invoices?status=draft&q=Cliente%20E2E&series=E2E`, {
      headers: { Cookie: cookieHeader },
    });
    const filteredInvoiceResult = await filteredInvoiceResponse.json() as { success?: boolean; invoices?: Array<{ client_name?: string }> };
    assert(filteredInvoiceResponse.ok && filteredInvoiceResult.success, "invoice filtered listing works with authenticated API");
    assert((filteredInvoiceResult.invoices?.length ?? 0) >= 1, "invoice filtered listing returns created draft");

    const conversationResponse = await fetch(`${baseUrl}/api/chat/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title: "Conversacion E2E" }),
    });
    const conversationResult = await conversationResponse.json() as { success?: boolean; conversation?: { id?: string } };
    assert(conversationResponse.ok && conversationResult.success && Boolean(conversationResult.conversation?.id), "chat conversations endpoint works with authenticated session");

    console.log("Authenticated E2E status: PASS");

}

main().catch((error) => {
  console.error("Authenticated E2E status: FAIL");
  console.error(error);
  process.exit(1);
});
