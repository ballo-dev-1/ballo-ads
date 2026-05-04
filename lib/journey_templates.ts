import { FlowNodeModel } from "@/lib/crmStores";

export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  nodes: FlowNodeModel[];
  edges: Array<[string, string]>;
}

export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    id: "welcome_onboarding",
    name: "New Signup Welcome",
    description: "Welcome new clients and guide them to their first top-up.",
    nodes: [
      { id: "t0", type: "wait", x: 100, y: 50, config: { type: "wait", event: "new_signup" }, label: "Trigger: New Signup" },
      { id: "t1", type: "whatsapp", x: 100, y: 180, config: { type: "whatsapp", msg: "Hi {{company_name}}, welcome to BalloAds! 🚀" }, label: "Welcome WhatsApp" },
      { id: "t2", type: "delay", x: 100, y: 310, config: { type: "delay", amount: 2, unit: "days" }, label: "Wait 2 days" },
      { id: "t3", type: "condition", x: 100, y: 440, config: { type: "condition", attr: "credits", op: ">", val: "0" }, label: "Has credits?" },
      { id: "t4", type: "email", x: -50, y: 580, config: { type: "email", subject: "How can we help?", body: "Hi {{company_name}}, we noticed you haven't funded your account yet..." }, label: "Follow-up Email" },
      { id: "t5", type: "stop", x: 250, y: 580, config: { type: "stop", reason: "completed" }, label: "Onboarding Done" },
    ],
    edges: [
      ["t0", "t1"],
      ["t1", "t2"],
      ["t2", "t3"],
      ["t3", "t4"], // No path
      ["t3", "t5"], // Yes path
    ],
  },
  {
    id: "churn_prevention",
    name: "Churn Prevention",
    description: "Re-engage clients who haven't logged in for 30 days.",
    nodes: [
      { id: "c0", type: "wait", x: 100, y: 50, config: { type: "wait", event: "inactive_30d" }, label: "Trigger: Inactive 30d" },
      { id: "c1", type: "sms", x: 100, y: 180, config: { type: "sms", msg: "Hi {{company_name}}, we miss you! Check out our new reach options." }, label: "Re-engagement SMS" },
      { id: "c2", type: "delay", x: 100, y: 310, config: { type: "delay", amount: 3, unit: "days" }, label: "Wait 3 days" },
      { id: "c3", type: "mark", x: 100, y: 440, config: { type: "mark", marker: "churn-risk", action: "add" }, label: "Mark as Churn Risk" },
      { id: "c4", type: "slack", x: 100, y: 570, config: { type: "slack", channel: "#sales-alerts", msg: "VIP {{company_name}} is at risk of churning." }, label: "Sales Alert" },
    ],
    edges: [
      ["c0", "c1"],
      ["c1", "c2"],
      ["c2", "c3"],
      ["c3", "c4"],
    ],
  },
  {
    id: "credit_recovery",
    name: "Low Credit Recovery",
    description: "Alert clients when their balance is low to prevent campaign pauses.",
    nodes: [
      { id: "r0", type: "wait", x: 100, y: 50, config: { type: "wait", event: "credits_low" }, label: "Trigger: Credits Low" },
      { id: "r1", type: "whatsapp", x: 100, y: 180, config: { type: "whatsapp", msg: "Your BalloAds credits are low! Top up now to keep campaigns active." }, label: "Low Credit Alert" },
      { id: "r2", type: "delay", x: 100, y: 310, config: { type: "delay", amount: 1, unit: "days" }, label: "Wait 1 day" },
      { id: "r3", type: "popup", x: 100, y: 440, config: { type: "popup", title: "Refill Credits", body: "Don't let your ads stop!", ctaText: "Top up now" }, label: "Dashboard Popup" },
    ],
    edges: [
      ["r0", "r1"],
      ["r1", "r2"],
      ["r2", "r3"],
    ],
  },
  {
    id: "george_verification",
    name: "George Verification Journey",
    description: "Simulates back-to-back SMS and Email for verification.",
    nodes: [
      { id: "v0", type: "wait", x: 100, y: 50, config: { type: "wait", event: "manual" }, label: "Trigger: Manual" },
      { id: "v1", type: "sms", x: 100, y: 180, config: { type: "sms", msg: "Hi George, verification SMS working! 🚀" }, label: "Verification SMS" },
      { id: "v2", type: "email", x: 100, y: 310, config: { type: "email", subject: "Verification Working", body: "Hi George,\n\nVerification email working!\n\nBest,\nBalloAds" }, label: "Verification Email" },
    ],
    edges: [
      ["v0", "v1"],
      ["v1", "v2"],
    ],
  },
];
