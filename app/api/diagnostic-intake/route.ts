const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "NOT_CONNECTED",
      acceptsRealProspectData: false,
      source: "SEKINFRA_WEBSITE",
      contractVersion: "sekinfra.website-diagnostic-intake.v1",
      message: "Governed acquisition intake is not connected yet.",
    }),
    { status: 200, headers },
  );
}

export async function POST() {
  return new Response(
    JSON.stringify({
      error: "INTAKE_NOT_CONNECTED",
      acceptsRealProspectData: false,
      message: "Real prospect intake is disabled until the Sekinfra Acquisition System is approved for real data and an explicit adapter is connected.",
    }),
    { status: 503, headers },
  );
}
