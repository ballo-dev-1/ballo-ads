import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** Legal name of the SMS aggregator — update to match your MNO agreements. */
export const SMS_AGGREGATOR_LEGAL_NAME =
  process.env.NEXT_PUBLIC_SMS_AGGREGATOR_LEGAL_NAME ?? "Ballo Ads Limited";

export type LetterOfConsentInput = {
  companyName?: string;
  senderId?: string;
  networks: string[];
  physicalAddress?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  email?: string;
  /** Used as tagline under company name when set */
  description?: string;
  submittedAt: string;
};

export type LetterOfConsentModel = {
  companyNameUpper: string;
  tagline: string;
  addressLine: string;
  phone: string;
  website: string;
  email: string;
  dateStr: string;
  recipientLines: string[];
  mnoLegalName: string;
  companyLegalName: string;
  bodyParagraph: string;
  senderId: string;
  /** One or more example SMS bodies for the letter table (MNO filings). */
  smsSamples: string[];
  signatoryName: string;
  signingEntity: string;
};

function normalizePrimaryNetwork(networks: string[]): string {
  const n = (networks[0] ?? "Mtn").trim();
  if (/^mtn$/i.test(n)) return "Mtn";
  if (/^airtel$/i.test(n)) return "Airtel";
  if (/^zamtel$/i.test(n)) return "Zamtel";
  if (/^zedmobile$/i.test(n)) return "Zedmobile";
  return n;
}

function recipientLinesForNetwork(key: string): string[] {
  switch (key) {
    case "Mtn":
      return [
        "MTN Zambia Ltd",
        "Yello House,",
        "Plot No. 1680, Great East Road,",
        "Lusaka",
      ];
    case "Airtel":
      return [
        "Airtel Networks Zambia Plc",
        "Airtel House,",
        "Lusaka",
        "Zambia",
      ];
    case "Zamtel":
      return ["Zamtel Plc", "P.O. Box 3768,", "Lusaka", "Zambia"];
    case "Zedmobile":
      return ["Zedmobile", "Lusaka", "Zambia"];
    default:
      return [`${key} (Mobile Network Operator)`, "Lusaka", "Zambia"];
  }
}

export function buildSmsContentSample(senderId: string): string {
  const sid = senderId.trim() || "YOURID";
  return `Hey Customer, your payment notification was received. Ref: SAMPLE123. Thanks – ${sid}.`;
}

export function buildLetterOfConsentModel(
  input: LetterOfConsentInput,
): LetterOfConsentModel {
  const primary = normalizePrimaryNetwork(input.networks);
  const recipientLines = recipientLinesForNetwork(primary);
  const mnoLegalName = recipientLines[0] ?? "MTN Zambia Ltd";
  const companyLegalName = (input.companyName ?? "the applicant company").trim();
  const senderId = (input.senderId ?? "—").trim();
  const d = new Date(input.submittedAt);
  const longDate: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const dateStr = Number.isNaN(d.getTime())
    ? new Date().toLocaleDateString("en-GB", longDate)
    : d.toLocaleDateString("en-GB", longDate);

  const tagline =
    input.description?.trim() ||
    "Supporting compliant business messaging through a simple, trusted digital platform.";

  const bodyParagraph = `This letter serves to inform ${mnoLegalName} that (${companyLegalName}) has authorized ${SMS_AGGREGATOR_LEGAL_NAME} to handle the SMS traffic with the sender ID (${senderId === "—" ? "pending" : senderId}).`;

  return {
    companyNameUpper: (input.companyName ?? "Company").toUpperCase(),
    tagline,
    addressLine: (input.physicalAddress ?? "—").trim(),
    phone: (input.phoneNumber ?? "—").trim(),
    website: (input.websiteUrl ?? "—").trim(),
    email: (input.email ?? "—").trim(),
    dateStr,
    recipientLines,
    mnoLegalName,
    companyLegalName,
    bodyParagraph,
    senderId: senderId === "—" ? "" : senderId,
    smsSamples: [buildSmsContentSample(senderId === "—" ? "SENDER" : senderId)],
    signatoryName: "Authorised Signatory",
    signingEntity: companyLegalName,
  };
}

type DocWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };

export function downloadLetterOfConsentPdf(
  m: LetterOfConsentModel,
  filenamePrefix?: string,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 22;
  const contentW = pageW - 2 * margin;
  /** ~65 characters at 11pt — readable line length */
  const bodyLineW = Math.min(118, contentW);
  let y = 20;

  doc.setFont("times", "bold");
  doc.setFontSize(17);
  doc.text(m.companyNameUpper, pageW / 2, y, { align: "center" });
  y += 7;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  const taglines = doc.splitTextToSize(m.tagline, contentW);
  doc.text(taglines, pageW / 2, y, { align: "center" });
  y += taglines.length * 5 + 5;

  const contactParts: string[] = [];
  if (m.addressLine && m.addressLine !== "—") {
    contactParts.push(m.addressLine);
  }
  if (m.phone && m.phone !== "—") {
    contactParts.push(`Phone / WhatsApp: ${m.phone}`);
  }
  if (m.website && m.website !== "—") {
    contactParts.push(`Website: ${m.website}`);
  }
  if (m.email && m.email !== "—") {
    contactParts.push(`Email: ${m.email}`);
  }
  if (contactParts.length === 0) {
    contactParts.push("—");
  }
  const contactBlockW = Math.min(95, contentW);
  let contactY = y;
  for (const part of contactParts) {
    const lines = doc.splitTextToSize(part, contactBlockW);
    doc.text(lines, pageW / 2, contactY, { align: "center" });
    contactY += lines.length * 5;
  }
  y = contactY + 6;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont("times", "normal");
  doc.text(`Date: ${m.dateStr}`, margin, y);
  y += 8;
  m.recipientLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 5.5;
  });
  y += 6;

  doc.setFont("times", "bold");
  doc.text("Re: LETTER OF CONSENT", margin, y);
  y += 9;

  doc.setFont("times", "normal");
  const body = doc.splitTextToSize(m.bodyParagraph, bodyLineW);
  doc.text(body, margin, y);
  y += body.length * 5 + 7;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: contentW,
    head: [["Sender ID", "SMS Content Sample"]],
    body: (m.smsSamples.length ? m.smsSamples : ["—"]).map((text) => [
      m.senderId || "—",
      text,
    ]),
    styles: {
      font: "times",
      fontSize: 10,
      cellPadding: 2.5,
      valign: "top",
      lineColor: [200, 200, 204],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      lineColor: [180, 184, 192],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: contentW - 38 },
    },
  });

  const dWith = doc as DocWithAutoTable;
  y = (dWith.lastAutoTable?.finalY ?? y) + 14;

  doc.setFont("times", "normal");
  doc.text("Thank you for your co-operation", margin, y);
  y += 7;
  doc.text("Yours faithfully", margin, y);
  y += 16;
  doc.text(m.signatoryName, margin, y);
  y += 5.5;
  doc.text(m.signingEntity, margin, y);

  const safe = (filenamePrefix || m.senderId || "consent").replace(
    /[^a-z0-9-_]/gi,
    "_",
  );
  doc.save(`letter-of-consent-${safe}.pdf`);
}
