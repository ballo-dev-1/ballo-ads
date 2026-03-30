export type MtnSubmissionStatus = "pending" | "accepted" | "withdrawn";

export type MtnSubmissionRecord = {
  id: string;
  submittedAt: string;
  companyId: number;
  companyName?: string;
  senderId?: string;
  networks: string[];
  registrationDocumentUrl?: string;
  signatureImageUrl?: string;
  profileImageUrl?: string;
  email?: string;
  phoneNumber?: string;
  physicalAddress?: string;
  industry?: string;
  description?: string;
  websiteUrl?: string;
};

type Stored = MtnSubmissionRecord & { status: MtnSubmissionStatus };

const store = new Map<string, Stored>();

function seedIfEmpty() {
  if (store.size > 0) return;
  store.set("demo-seed-1", {
    id: "demo-seed-1",
    submittedAt: new Date().toISOString(),
    companyId: 0,
    companyName: "Demo Company Ltd",
    senderId: "DEMOSND",
    networks: ["Mtn"],
    status: "pending",
    email: "compliance@example.com",
    industry: "Technology",
    description: "Sample submission for MTN review portal demo.",
  });
}

export function mtnListSubmissions(): Stored[] {
  seedIfEmpty();
  return [...store.values()].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function mtnGetSubmission(id: string): Stored | undefined {
  seedIfEmpty();
  return store.get(id);
}

export function mtnAppendSubmission(
  payload: Omit<MtnSubmissionRecord, "id" | "submittedAt">,
): Stored {
  seedIfEmpty();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const row: Stored = {
    ...payload,
    id,
    submittedAt: new Date().toISOString(),
    status: "pending",
  };
  store.set(id, row);
  return row;
}

export function mtnUpdateSubmissionStatus(
  id: string,
  status: Exclude<MtnSubmissionStatus, "pending">,
): Stored | null {
  seedIfEmpty();
  const row = store.get(id);
  if (!row) return null;
  const next: Stored = { ...row, status };
  store.set(id, next);
  return next;
}
