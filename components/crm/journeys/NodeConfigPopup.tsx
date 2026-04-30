"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { linksApi, uploadsApi } from "@/lib/crmApiClient";
import { useJourneyStore } from "@/lib/crmStores";

interface NodeConfigPopupProps {
  nodeId: string;
}

type ConfigForm = Record<string, string | number | boolean | undefined>;

export function NodeConfigPopup({ nodeId }: NodeConfigPopupProps) {
  const nodes = useJourneyStore((s) => s.nodes);
  const updateNodeConfig = useJourneyStore((s) => s.updateNodeConfig);
  const closeConfigPopup = useJourneyStore((s) => s.closeConfigPopup);
  const node = nodes.find((n) => n.id === nodeId);
  const [formData, setFormData] = useState<ConfigForm>((node?.config as ConfigForm) || {});
  const [shortLink, setShortLink] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  useEffect(() => {
    if (node) setFormData(node.config as ConfigForm);
  }, [node]);

  if (!node) return null;

  const set = (key: string, value: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleInsertLink = async (urlKey: string, msgKey?: string) => {
    const url = formData[urlKey];
    if (!url) return;
    try {
      const res = await linksApi.create(String(url));
      const sl = res.shortUrl;
      setShortLink(sl);
      if (msgKey) set(msgKey, `${formData[msgKey] || ""} ${sl}`.trim());
      toast.success(`Tracked link created: ${sl}`);
    } catch {
      toast.error("Failed to create tracked link");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const res = await uploadsApi.uploadImage(file);
      const url = res.url;
      setUploadedImageUrl(url);
      set("imageUrl", url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleSave = () => {
    let label = "Configured";
    const f = formData as Record<string, string | number | undefined>;

    switch (node.type) {
      case "sms":
      case "whatsapp":
        label = String(f.msg || "").slice(0, 40) || "Message set";
        break;
      case "email":
        label = `Subject: ${String(f.subject || "").slice(0, 30)}`;
        break;
      case "popup":
        label = String(f.title || "") || "Popup set";
        break;
      case "inbox":
        label = String(f.title || "") || "Inbox set";
        break;
      case "delay":
        label = `Wait ${f.amount} ${f.unit}`;
        break;
      case "wait":
        label = String(f.event || "") || "Wait for event";
        break;
      case "split":
        label = `A: ${f.aPct}% / B: ${f.bPct}%`;
        break;
      case "condition":
        label = `${f.attr} ${f.op} ${f.val}`;
        break;
      case "funnel":
        label = String(f.name || "") || "Funnel marker";
        break;
      case "stop":
        label = String(f.reason || "") || "Stop";
        break;
      case "update":
        label = `Set ${f.attr} = ${f.val}`;
        break;
      case "mark":
        label = `Mark: ${f.marker}`;
        break;
      case "webhook":
        label = String(f.url || "").slice(0, 35) || "Webhook";
        break;
      case "slack":
        label = `${f.channel || "#channel"} alert`;
        break;
      case "schedule":
        label = `${f.date || ""} ${f.time || ""}`;
        break;
    }

    updateNodeConfig(nodeId, formData as Record<string, unknown>, label);
    toast.success("Node saved");
  };

  return (
    <div
      className="fixed z-[600] border border-white/[0.14] rounded-xl p-5 w-[320px] shadow-2xl"
      style={{ background: "var(--crm-panel)" }}
      style={{ top: "80px", right: "20px" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-200 capitalize text-sm">Configure: {node.type}</h3>
        <button onClick={closeConfigPopup} className="text-slate-400 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>

      <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
        {(node.type === "sms" || node.type === "whatsapp") && (
          <>
            <Field label="Message">
              <textarea
                className="crm-ncp-input resize-none h-24"
                placeholder="Hi {{company_name}}, ..."
                value={String(formData.msg || "")}
                onChange={(e) => set("msg", e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Variables: {"{{company_name}} {{plan}} {{credits}}"}
              </p>
            </Field>
            <Field label="Insert tracked link">
              <div className="flex gap-2">
                <input
                  className="crm-ncp-input flex-1"
                  placeholder="https://..."
                  value={String(formData.linkUrl || "")}
                  onChange={(e) => set("linkUrl", e.target.value)}
                />
                <button
                  onClick={() => handleInsertLink("linkUrl", "msg")}
                  className="px-2.5 py-1.5 text-[11.5px] rounded-[7px] bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:bg-white/[0.1]"
                >
                  Shorten
                </button>
              </div>
              {shortLink && <p className="text-xs text-blue-400 mt-1 font-mono">{shortLink}</p>}
            </Field>
          </>
        )}

        {node.type === "email" && (
          <>
            <Field label="Subject">
              <input
                className="crm-ncp-input"
                placeholder="Your BalloAds credits are running low"
                value={String(formData.subject || "")}
                onChange={(e) => set("subject", e.target.value)}
              />
            </Field>
            <Field label="Body">
              <textarea
                className="crm-ncp-input resize-none h-28"
                placeholder={"Hi {{company_name}},\n\n..."}
                value={String(formData.body || "")}
                onChange={(e) => set("body", e.target.value)}
              />
            </Field>
            <Field label="Tracked link">
              <div className="flex gap-2">
                <input
                  className="crm-ncp-input flex-1"
                  placeholder="https://..."
                  value={String(formData.linkUrl || "")}
                  onChange={(e) => set("linkUrl", e.target.value)}
                />
                <button
                  onClick={() => handleInsertLink("linkUrl", "body")}
                  className="px-2.5 py-1.5 text-[11.5px] rounded-[7px] bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:bg-white/[0.1]"
                >
                  Track
                </button>
              </div>
            </Field>
          </>
        )}

        {node.type === "popup" && (
          <>
            <Field label="Title">
              <input
                className="crm-ncp-input"
                placeholder="Special offer!"
                value={String(formData.title || "")}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field label="Message">
              <textarea
                className="crm-ncp-input resize-none h-20"
                placeholder="Upgrade your plan..."
                value={String(formData.body || "")}
                onChange={(e) => set("body", e.target.value)}
              />
            </Field>
            <Field label="Image (optional)">
              <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500/40 transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                <p className="text-xs text-slate-400">
                  {uploadedImageUrl ? "✓ Image uploaded" : "Click to upload PNG/JPG (max 2MB)"}
                </p>
              </div>
            </Field>
            <Field label="CTA text">
              <input
                className="crm-ncp-input"
                placeholder="Upgrade now"
                value={String(formData.ctaText || "")}
                onChange={(e) => set("ctaText", e.target.value)}
              />
            </Field>
            <Field label="CTA link">
              <div className="flex gap-2">
                <input
                  className="crm-ncp-input flex-1"
                  placeholder="https://..."
                  value={String(formData.ctaUrl || "")}
                  onChange={(e) => set("ctaUrl", e.target.value)}
                />
                <button
                  onClick={() => handleInsertLink("ctaUrl")}
                  className="px-2.5 py-1.5 text-[11.5px] rounded-[7px] bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:bg-white/[0.1]"
                >
                  Track
                </button>
              </div>
            </Field>
          </>
        )}

        {node.type === "inbox" && (
          <>
            <Field label="Title">
              <input
                className="crm-ncp-input"
                placeholder="New feature available"
                value={String(formData.title || "")}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field label="Message">
              <textarea
                className="crm-ncp-input resize-none h-20"
                value={String(formData.body || "")}
                onChange={(e) => set("body", e.target.value)}
              />
            </Field>
            <Field label="Action link">
              <div className="flex gap-2">
                <input
                  className="crm-ncp-input flex-1"
                  placeholder="https://..."
                  value={String(formData.actionUrl || "")}
                  onChange={(e) => set("actionUrl", e.target.value)}
                />
                <button
                  onClick={() => handleInsertLink("actionUrl")}
                  className="px-2.5 py-1.5 text-[11.5px] rounded-[7px] bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:bg-white/[0.1]"
                >
                  Track
                </button>
              </div>
            </Field>
          </>
        )}

        {node.type === "delay" && (
          <Field label="Delay duration">
            <div className="grid grid-cols-2 gap-2">
              <input
                className="crm-ncp-input"
                type="number"
                min="1"
                placeholder="2"
                value={String(formData.amount || "")}
                onChange={(e) => set("amount", parseInt(e.target.value))}
              />
              <select
                className="crm-ncp-input"
                value={String(formData.unit || "days")}
                onChange={(e) => set("unit", e.target.value)}
              >
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
              </select>
            </div>
          </Field>
        )}

        {node.type === "wait" && (
          <>
            <Field label="Wait for event">
              <select
                className="crm-ncp-input"
                value={String(formData.event || "")}
                onChange={(e) => set("event", e.target.value)}
              >
                <option value="">Select event...</option>
                <option value="login">Client logs in</option>
                <option value="campaign_sent">Campaign created</option>
                <option value="credits_purchased">Credits topped up</option>
                <option value="plan_changed">Plan upgraded</option>
              </select>
            </Field>
            <Field label="Timeout (if event doesn't happen)">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="crm-ncp-input"
                  type="number"
                  min="1"
                  placeholder="3"
                  value={String(formData.timeoutAmount || "")}
                  onChange={(e) => set("timeoutAmount", parseInt(e.target.value))}
                />
                <select
                  className="crm-ncp-input"
                  value={String(formData.timeoutUnit || "days")}
                  onChange={(e) => set("timeoutUnit", e.target.value)}
                >
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                </select>
              </div>
            </Field>
          </>
        )}

        {node.type === "split" && (
          <>
            <Field label="Branch A %">
              <input
                className="crm-ncp-input"
                type="number"
                min="1"
                max="99"
                value={Number(formData.aPct ?? 50)}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  set("aPct", v);
                  set("bPct", 100 - v);
                }}
              />
            </Field>
            <Field label="Branch B %">
              <input
                className="crm-ncp-input"
                type="number"
                min="1"
                max="99"
                value={Number(formData.bPct ?? 50)}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  set("bPct", v);
                  set("aPct", 100 - v);
                }}
              />
            </Field>
          </>
        )}

        {node.type === "condition" && (
          <>
            <Field label="Attribute">
              <select
                className="crm-ncp-input"
                value={String(formData.attr || "")}
                onChange={(e) => set("attr", e.target.value)}
              >
                <option value="">Select attribute...</option>
                <option value="health_score">health_score</option>
                <option value="credits">credits</option>
                <option value="plan">plan</option>
                <option value="industry">industry</option>
                <option value="last_active_days">last_active_days</option>
              </select>
            </Field>
            <Field label="Operator">
              <select
                className="crm-ncp-input"
                value={String(formData.op || ">")}
                onChange={(e) => set("op", e.target.value)}
              >
                <option value=">">greater than</option>
                <option value="<">less than</option>
                <option value="=">equals</option>
                <option value=">=">greater than or equal</option>
                <option value="<=">less than or equal</option>
                <option value="contains">contains</option>
              </select>
            </Field>
            <Field label="Value">
              <input
                className="crm-ncp-input"
                placeholder="e.g. 100, Pro, Insurance"
                value={String(formData.val || "")}
                onChange={(e) => set("val", e.target.value)}
              />
            </Field>
          </>
        )}

        {node.type === "funnel" && (
          <>
            <Field label="Marker name">
              <input
                className="crm-ncp-input"
                placeholder="e.g. SMS sent, Converted"
                value={String(formData.name || "")}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Marker type">
              <select
                className="crm-ncp-input"
                value={String(formData.markerType || "impression")}
                onChange={(e) => set("markerType", e.target.value)}
              >
                <option value="impression">Impression</option>
                <option value="click">Click</option>
                <option value="conversion">Conversion</option>
                <option value="drop-off">Drop-off</option>
              </select>
            </Field>
          </>
        )}

        {node.type === "stop" && (
          <>
            <Field label="Stop reason">
              <select
                className="crm-ncp-input"
                value={String(formData.reason || "completed")}
                onChange={(e) => set("reason", e.target.value)}
              >
                <option value="completed">Client converted</option>
                <option value="max_sends">Max sends reached</option>
                <option value="unsubscribed">Client unsubscribed</option>
                <option value="manual">Manual stop</option>
              </select>
            </Field>
            <Field label="">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.archive)}
                  onChange={(e) => set("archive", e.target.checked)}
                />
                <span className="text-xs text-slate-300">Archive client from future journeys</span>
              </label>
            </Field>
          </>
        )}

        {node.type === "update" && (
          <>
            <Field label="Attribute to update">
              <select
                className="crm-ncp-input"
                value={String(formData.attr || "")}
                onChange={(e) => set("attr", e.target.value)}
              >
                <option value="">Select attribute...</option>
                <option value="assigned_rep">assigned_rep</option>
                <option value="custom_tag">custom_tag</option>
                <option value="crm_notes">crm_notes</option>
              </select>
            </Field>
            <Field label="New value">
              <input
                className="crm-ncp-input"
                value={String(formData.val || "")}
                onChange={(e) => set("val", e.target.value)}
              />
            </Field>
          </>
        )}

        {node.type === "mark" && (
          <>
            <Field label="Marker / tag">
              <input
                className="crm-ncp-input"
                placeholder="e.g. re-engaged, vip, upsell-ready"
                value={String(formData.marker || "")}
                onChange={(e) => set("marker", e.target.value)}
              />
            </Field>
            <Field label="Action">
              <select
                className="crm-ncp-input"
                value={String(formData.action || "add")}
                onChange={(e) => set("action", e.target.value)}
              >
                <option value="add">Add marker</option>
                <option value="remove">Remove marker</option>
              </select>
            </Field>
          </>
        )}

        {node.type === "webhook" && (
          <>
            <Field label="Webhook URL">
              <input
                className="crm-ncp-input"
                placeholder="https://yourserver.com/webhook"
                value={String(formData.url || "")}
                onChange={(e) => set("url", e.target.value)}
              />
            </Field>
            <Field label="Method">
              <select
                className="crm-ncp-input"
                value={String(formData.method || "POST")}
                onChange={(e) => set("method", e.target.value)}
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </Field>
            <Field label="Payload (JSON)">
              <textarea
                className="crm-ncp-input font-mono text-xs resize-none h-20"
                placeholder={'{"client_id":"{{id}}","event":"{{trigger}}"}'}
                value={String(formData.payload || "")}
                onChange={(e) => set("payload", e.target.value)}
              />
            </Field>
          </>
        )}

        {node.type === "slack" && (
          <>
            <Field label="Slack webhook URL">
              <input
                className="crm-ncp-input"
                placeholder="https://hooks.slack.com/services/..."
                value={String(formData.url || "")}
                onChange={(e) => set("url", e.target.value)}
              />
            </Field>
            <Field label="Message">
              <textarea
                className="crm-ncp-input resize-none h-20"
                placeholder="Alert: {{company_name}} has triggered the journey"
                value={String(formData.msg || "")}
                onChange={(e) => set("msg", e.target.value)}
              />
            </Field>
            <Field label="Channel">
              <input
                className="crm-ncp-input"
                placeholder="#crm-alerts"
                value={String(formData.channel || "")}
                onChange={(e) => set("channel", e.target.value)}
              />
            </Field>
          </>
        )}

        {node.type === "schedule" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date">
                <input
                  className="crm-ncp-input"
                  type="date"
                  value={String(formData.date || "")}
                  onChange={(e) => set("date", e.target.value)}
                />
              </Field>
              <Field label="Time">
                <input
                  className="crm-ncp-input"
                  type="time"
                  value={String(formData.time || "09:00")}
                  onChange={(e) => set("time", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Timezone">
              <select
                className="crm-ncp-input"
                value={String(formData.tz || "Africa/Lusaka")}
                onChange={(e) => set("tz", e.target.value)}
              >
                <option value="Africa/Lusaka">Africa/Lusaka (CAT)</option>
                <option value="UTC">UTC</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                <option value="Africa/Nairobi">Africa/Nairobi</option>
              </select>
            </Field>
            <Field label="Repeat">
              <select
                className="crm-ncp-input"
                value={String(formData.repeat || "once")}
                onChange={(e) => set("repeat", e.target.value)}
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </Field>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/[0.08]">
        <button
          onClick={closeConfigPopup}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-xs rounded-lg font-medium transition-colors"
          style={{ background: "var(--brand-color-3)", color: "white" }}
        >
          Save node
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>}
      {children}
    </div>
  );
}
