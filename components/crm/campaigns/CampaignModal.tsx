"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/crmStores";
import { campaignsApi, linksApi, uploadsApi } from "@/lib/crmApiClient";
import { Button, FormField, Input, Modal, Select, Textarea } from "@/components/crm/ui/Primitives";
import type { Channel } from "@/lib/crmTypes";

type AudienceMode = "segment" | "manual" | "csv";
const CHANNELS: { id: Channel; label: string; icon: string }[] = [
  { id: "sms", label: "SMS", icon: "💬" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "whatsapp", label: "WhatsApp", icon: "📱" },
  { id: "popup", label: "Popup", icon: "🔔" },
  { id: "inbox", label: "Inbox", icon: "📥" },
];

export function CampaignModal() {
  const closeModal = useAppStore((s) => s.closeModal);
  const activeModal = useAppStore((s) => s.activeModal);
  const prefilledSegmentId = activeModal?.id === "campaign" ? activeModal.props?.segmentId ?? "" : "";

  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState<Channel>("sms");
  const [name, setName] = useState("");
  const [senderId, setSenderId] = useState("BalloAds");
  const [audMode, setAudMode] = useState<AudienceMode>("segment");
  const [segmentId, setSegmentId] = useState(prefilledSegmentId);
  const [manualContacts, setManualContacts] = useState<string[]>([]);
  const [pillInput, setPillInput] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [popTitle, setPopTitle] = useState("");
  const [popMsg, setPopMsg] = useState("");
  const [popImgUrl, setPopImgUrl] = useState("");
  const [popCta, setPopCta] = useState("");
  const [popUrl, setPopUrl] = useState("");
  const [inboxTitle, setInboxTitle] = useState("");
  const [inboxMsg, setInboxMsg] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [sendWhen, setSendWhen] = useState<"now" | "later" | "recurring">("now");
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("09:00");
  const [userLimit, setUserLimit] = useState(1000);
  const [launching, setLaunching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addPill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = pillInput.trim().replace(",", "");
      if (v && !manualContacts.includes(v)) {
        setManualContacts((p) => [...p, v]);
        setPillInput("");
      }
    }
  };

  const handleCSV = (file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = (e.target?.result as string).split("\n").slice(0, 5);
      setCsvPreview(lines);
    };
    reader.readAsText(file);
  };

  const insertLink = async () => {
    if (!linkInput) return;
    try {
      const res = await linksApi.create(linkInput);
      const sl = res.shortUrl ?? "";
      setShortLink(sl);
      if (channel === "sms" || channel === "whatsapp") setMsg((p) => `${p} ${sl}`.trim());
      else if (channel === "email") setEmailBody((p) => `${p}\n${sl}`);
      toast.success(`Tracked link: ${sl}`);
    } catch {
      toast.error("Failed to create tracked link");
    }
  };

  const handlePopupImg = async (file: File) => {
    try {
      const res = await uploadsApi.uploadImage(file, "popup-images");
      setPopImgUrl(res.url ?? "");
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const launch = async () => {
    if (!name.trim()) {
      toast.error("Campaign name required");
      return;
    }
    setLaunching(true);
    try {
      const content: Record<string, unknown> = {};
      if (channel === "sms" || channel === "whatsapp") {
        content.msg = msg;
        content.sender_id = senderId;
      } else if (channel === "email") {
        content.subject = subject;
        content.body = emailBody;
      } else if (channel === "popup") {
        content.title = popTitle;
        content.body = popMsg;
        content.imageUrl = popImgUrl;
        content.ctaText = popCta;
        content.ctaUrl = popUrl;
      } else if (channel === "inbox") {
        content.title = inboxTitle;
        content.body = inboxMsg;
      }

      await campaignsApi.create({
        name,
        channel,
        segmentId: audMode === "segment" ? segmentId : undefined,
        manualContactIds: audMode === "manual" ? manualContacts : undefined,
        content,
        scheduledAt: sendWhen === "later" ? `${schedDate}T${schedTime}:00` : null,
        userLimit,
      });

      toast.success(`Campaign "${name}" launched!`);
      closeModal();
    } catch {
      toast.error("Failed to launch campaign");
    } finally {
      setLaunching(false);
    }
  };

  const steps = ["Channel", "Audience", "Content", "Schedule"];
  const charCount = msg.length;
  const smsParts = Math.ceil(charCount / 160) || 1;

  return (
    <Modal
      title="Build campaign"
      subtitle="Create a targeted message to send across any channel"
      onClose={closeModal}
      width={580}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          )}
          <Button
            variant="primary"
            onClick={step === 3 ? launch : () => setStep((s) => s + 1)}
            disabled={launching}
          >
            {step === 3 ? (launching ? "Launching..." : "Launch campaign ✓") : "Next →"}
          </Button>
        </>
      }
    >
      <div className="flex mb-5 -mt-1">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => i < step && setStep(i)}
            className={`flex-1 text-center py-2 text-[11.5px] cursor-pointer transition-colors border-b-2 ${
              i === step
                ? "border-blue-500 text-blue-300 font-semibold"
                : i < step
                ? "border-blue-500/40 text-slate-400 hover:text-slate-300"
                : "border-white/10 text-slate-500"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <FormField label="Campaign name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. May re-engagement — insurance" />
          </FormField>
          <FormField label="Select channel">
            <div className="grid grid-cols-5 gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={`p-3 rounded-lg text-center transition-all border ${
                    channel === c.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  <div className="text-xl mb-1">{c.icon}</div>
                  <div className="text-[10px] text-slate-300">{c.label}</div>
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Sender ID">
            <Input value={senderId} onChange={(e) => setSenderId(e.target.value)} />
          </FormField>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {(["segment", "manual", "csv"] as AudienceMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setAudMode(m)}
                className={`px-3 py-1.5 rounded-full text-[11.5px] border transition-all ${
                  audMode === m
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                {m === "segment" ? "Use segment" : m === "manual" ? "Enter contacts" : "Upload CSV"}
              </button>
            ))}
          </div>

          {audMode === "segment" && (
            <FormField label="Select segment">
              <Select value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
                <option value="">Choose a segment...</option>
                <option value="at-risk">At-risk clients (7)</option>
                <option value="inactive">Inactive 30+ days (12)</option>
                <option value="low-credits">Low credits (9)</option>
                <option value="all">All clients (48)</option>
              </Select>
            </FormField>
          )}

          {audMode === "manual" && (
            <FormField label="Add phone numbers or emails (press Enter after each)">
              <div
                className="flex flex-wrap gap-1.5 min-h-[40px] bg-white/[0.05] border border-white/[0.12] rounded-lg p-2 focus-within:border-blue-500 cursor-text"
                onClick={() => document.getElementById("pill-input")?.focus()}
              >
                {manualContacts.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 rounded px-2 py-0.5 text-[11.5px] text-blue-300"
                  >
                    {c}
                    <button
                      onClick={() => setManualContacts((p) => p.filter((x) => x !== c))}
                      className="text-blue-400/50 hover:text-red-400 text-[10px]"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="pill-input"
                  className="bg-transparent outline-none text-[12.5px] text-slate-200 min-w-[100px] flex-1"
                  placeholder="+260977... or email"
                  value={pillInput}
                  onChange={(e) => setPillInput(e.target.value)}
                  onKeyDown={addPill}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{manualContacts.length} contacts added</p>
            </FormField>
          )}

          {audMode === "csv" && (
            <FormField label="Upload contacts CSV">
              <div
                className="border-2 border-dashed border-white/10 rounded-lg p-5 text-center hover:border-blue-500/40 transition-colors relative cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCSV(e.target.files[0])}
                />
                <div className="text-3xl mb-2 opacity-40">📄</div>
                <p className="text-[12.5px] text-slate-300">
                  {csvFile ? `✓ ${csvFile.name}` : "Drop CSV here or click to browse"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Columns: phone, email, name (first row = headers)</p>
              </div>
              {csvPreview.length > 0 && (
                <div className="mt-2 bg-white/[0.03] rounded-lg p-3 font-mono text-[11px] text-slate-400 space-y-0.5">
                  <p className="text-emerald-400 mb-1">
                    ✓ {csvFile?.name} · {csvPreview.length - 1} rows detected
                  </p>
                  {csvPreview.slice(0, 3).map((l, i) => (
                    <div key={i} className="border-b border-white/[0.05] py-0.5">
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </FormField>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {(channel === "sms" || channel === "whatsapp") && (
            <FormField label="Message text">
              <Textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={4}
                placeholder="Hi {{company_name}}, ..."
              />
              <div className="flex justify-between mt-1">
                <span
                  className={`text-[11px] ${
                    charCount > 320 ? "text-red-400" : charCount > 160 ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  {charCount} / 160 chars · {smsParts} SMS
                </span>
                <span className="text-[11px] text-slate-500">{"{{company_name}} {{plan}} {{credits}}"}</span>
              </div>
            </FormField>
          )}
          {channel === "email" && (
            <>
              <FormField label="Subject line">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your BalloAds credits are running low"
                />
              </FormField>
              <FormField label="Body">
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                  placeholder={"Hi {{company_name}},\n\n..."}
                />
              </FormField>
            </>
          )}
          {channel === "popup" && (
            <>
              <FormField label="Title">
                <Input value={popTitle} onChange={(e) => setPopTitle(e.target.value)} placeholder="Special offer!" />
              </FormField>
              <FormField label="Message">
                <Textarea
                  value={popMsg}
                  onChange={(e) => setPopMsg(e.target.value)}
                  rows={3}
                  placeholder="Upgrade your plan and get..."
                />
              </FormField>
              <FormField label="Upload image (optional)">
                <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-blue-500/40 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files?.[0] && handlePopupImg(e.target.files[0])}
                  />
                  <p className="text-[12px] text-slate-400">
                    {popImgUrl ? "✓ Image uploaded" : "Click to upload PNG/JPG/GIF (max 2MB)"}
                  </p>
                </div>
              </FormField>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="CTA text">
                  <Input value={popCta} onChange={(e) => setPopCta(e.target.value)} placeholder="Upgrade now" />
                </FormField>
                <FormField label="CTA link">
                  <Input value={popUrl} onChange={(e) => setPopUrl(e.target.value)} placeholder="https://..." />
                </FormField>
              </div>
            </>
          )}
          {channel === "inbox" && (
            <>
              <FormField label="Title">
                <Input
                  value={inboxTitle}
                  onChange={(e) => setInboxTitle(e.target.value)}
                  placeholder="New feature available"
                />
              </FormField>
              <FormField label="Message">
                <Textarea value={inboxMsg} onChange={(e) => setInboxMsg(e.target.value)} rows={3} />
              </FormField>
            </>
          )}

          <FormField label="Insert tracked link (auto-shortened, CTR tracked)">
            <div className="flex gap-2">
              <Input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://balloinnovations.com/promo"
              />
              <Button variant="secondary" size="sm" onClick={insertLink}>
                Insert
              </Button>
            </div>
            {shortLink && (
              <div className="mt-2 bg-blue-500/[0.08] border border-blue-500/20 rounded-lg p-3 text-[12px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300">Shortened link (tracked)</span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">
                    CTR tracked
                  </span>
                </div>
                <code className="text-blue-300 font-mono">{shortLink}</code>
              </div>
            )}
          </FormField>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <FormField label="When to send">
            <Select value={sendWhen} onChange={(e) => setSendWhen(e.target.value as "now" | "later" | "recurring")}>
              <option value="now">Send immediately</option>
              <option value="later">Schedule for specific date/time</option>
              <option value="recurring">Recurring</option>
            </Select>
          </FormField>
          {sendWhen === "later" && (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date">
                <Input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
              </FormField>
              <FormField label="Time">
                <Input type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} />
              </FormField>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="User limit per run">
              <Input
                type="number"
                value={userLimit}
                onChange={(e) => setUserLimit(parseInt(e.target.value))}
                min={1}
              />
            </FormField>
            <FormField label="Execution speed">
              <Select defaultValue="500">
                <option value="100">100 per minute</option>
                <option value="500">500 per minute</option>
                <option value="1000">1000 per minute</option>
              </Select>
            </FormField>
          </div>

          <div className="bg-blue-500/[0.07] border border-blue-500/20 rounded-lg p-4 text-[12.5px]">
            <div className="font-semibold text-blue-300 mb-2">Campaign summary</div>
            <div className="text-slate-300 space-y-1">
              <div>
                Name: <span className="text-slate-100">{name || "—"}</span>
              </div>
              <div>
                Channel: <span className="text-slate-100">{channel.toUpperCase()}</span>
              </div>
              <div>
                Audience:{" "}
                <span className="text-slate-100">
                  {audMode === "segment"
                    ? segmentId || "No segment selected"
                    : `${manualContacts.length} manual contacts`}
                </span>
              </div>
              <div>
                Schedule:{" "}
                <span className="text-slate-100">
                  {sendWhen === "now"
                    ? "Immediately"
                    : sendWhen === "later"
                    ? `${schedDate} ${schedTime}`
                    : "Recurring"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
