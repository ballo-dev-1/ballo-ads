import { Pool } from "pg";

type WaitlistRow = {
  name: string;
  email: string;
  phone: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  const backendBaseUrl = requiredEnv("BACKEND_BASE_URL").replace(/\/+$/, "");
  const sourceUrl = process.env.LEGACY_DATABASE_URL;
  if (!sourceUrl) {
    throw new Error("Set LEGACY_DATABASE_URL for backfill source");
  }

  const source = new Pool({ connectionString: sourceUrl });

  try {
    const sourceRows = await source.query<WaitlistRow>(
      `SELECT "name","email","phone"
       FROM "Waitlist"
       ORDER BY "id" ASC`
    );

    let inserted = 0;
    let duplicates = 0;
    let failed = 0;
    for (const row of sourceRows.rows) {
      const res = await fetch(`${backendBaseUrl}/v1/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.name,
          email: row.email,
          phone: row.phone,
        }),
      });
      if (res.status === 200 || res.status === 201) {
        inserted += 1;
        continue;
      }
      if (res.status === 400 || res.status === 409) {
        duplicates += 1;
        continue;
      }
      failed += 1;
    }

    const sourceCount = await source.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM "Waitlist"');
    const targetRes = await fetch(`${backendBaseUrl}/Backoffice/waitlist?PageNumber=1&PageSize=1`, {
      headers: {
        Authorization: process.env.BACKOFFICE_BEARER_TOKEN
          ? `Bearer ${process.env.BACKOFFICE_BEARER_TOKEN}`
          : "",
      },
    });
    const targetJson = targetRes.ok ? ((await targetRes.json()) as { pagination?: { total?: number } }) : {};

    console.log(
      JSON.stringify(
        {
          sourceCount: Number(sourceCount.rows[0]?.count ?? "0"),
          targetCount: targetJson.pagination?.total ?? null,
          inserted,
          duplicates,
          failed,
        },
        null,
        2
      )
    );
  } finally {
    await source.end();
  }
}

main().catch((error) => {
  console.error("waitlist backfill failed", error);
  process.exit(1);
});
