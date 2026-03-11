"use client";

import { useState } from "react";
import Link from "next/link";

const codeSamples = {
  curl: `curl --location 'https://api.balloads.com/v1/api-messaging/sms/send' \\
--header 'Content-Type: application/json' \\
--header 'X-API-Key: ba_test_your_api_key_here' \\
--data '{
  "message": "Hello from BalloAds",
  "recipients": ["260974549983"]
}'`,
  javascript: `const response = await fetch("https://api.balloads.com/v1/api-messaging/sms/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "ba_test_your_api_key_here",
  },
  body: JSON.stringify({
    message: "Hello from BalloAds",
    recipients: ["260974549983"],
  }),
});

const data = await response.json();
console.log(data);`,
  nodeAxios: `import axios from "axios";

const { data } = await axios.post(
  "https://api.balloads.com/v1/api-messaging/sms/send",
  {
    message: "Hello from BalloAds",
    recipients: ["260974549983"],
  },
  {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "ba_test_your_api_key_here",
    },
  }
);

console.log(data);`,
  php: `<?php
$ch = curl_init("https://api.balloads.com/v1/api-messaging/sms/send");

$payload = json_encode([
  "message" => "Hello from BalloAds",
  "recipients" => ["260974549983"]
]);

curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "X-API-Key: ba_test_your_api_key_here"
  ],
  CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;`,
  python: `import requests

url = "https://api.balloads.com/v1/api-messaging/sms/send"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "ba_test_your_api_key_here"
}
payload = {
    "message": "Hello from BalloAds",
    "recipients": ["260974549983"]
}

response = requests.post(url, json=payload, headers=headers, timeout=30)
print(response.status_code)
print(response.json())`,
};

const sampleOptions = [
  { key: "curl", label: "cURL" },
  { key: "javascript", label: "JavaScript (fetch)" },
  { key: "nodeAxios", label: "Node.js (axios)" },
  { key: "php", label: "PHP" },
  { key: "python", label: "Python" },
] as const;

const sampleSuccessResponse = `{
  "requestId": "b6f4c0f4-5c75-4af9-8f20-5d2116b4f8fe",
  "channel": "Sms",
  "results": [
    {
      "recipient": "260974549983",
      "success": true,
      "error": null
    }
  ]
}`;

export default function ApiDocsPage() {
  const [activeSample, setActiveSample] =
    useState<(typeof sampleOptions)[number]["key"]>("curl");

  return (
    <main className="min-h-screen bg-[#EEF2FF] px-4 py-16 text-[var(--dark-blue)] md:px-8">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-color-1)]">
            API Docs
          </span>
          <h1 className="text-4xl font-bold md:text-5xl">Send SMS API</h1>
          <p className="max-w-3xl text-sm text-[var(--dark-blue)]/80 md:text-base">
            Use this endpoint to send SMS messages from your application using
            your Ballo Ads API key.
          </p>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">
            Endpoint Details
          </h2>
          <div className="mt-4 space-y-3 text-sm md:text-base">
            <p>
              <span className="font-semibold">Base URL:</span>{" "}
              <code className="rounded bg-slate-100 px-2 py-1">
                https://api.balloads.com
              </code>
            </p>
            <p>
              <span className="font-semibold">Route:</span>{" "}
              <code className="rounded bg-slate-100 px-2 py-1">
                POST /v1/api-messaging/sms/send
              </code>
            </p>
            <p>
              <span className="font-semibold">Headers:</span>{" "}
              <code className="rounded bg-slate-100 px-2 py-1">
                Content-Type: application/json
              </code>
              {"  "}
              <code className="rounded bg-slate-100 px-2 py-1">
                X-API-Key: &lt;your-api-key&gt;
              </code>
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">API Key Modes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm md:text-base">
            <li>
              <span className="font-semibold">Live keys</span> start with{" "}
              <code className="rounded bg-slate-100 px-2 py-1">ba_live_</code>.
            </li>
            <li>
              <span className="font-semibold">Test keys</span> start with{" "}
              <code className="rounded bg-slate-100 px-2 py-1">ba_test_</code>.
            </li>
            <li>
              Messages sent with test keys are automatically suffixed with{" "}
              <code className="rounded bg-slate-100 px-2 py-1">[TRIAL]</code>.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">
            Key and Sender ID Behavior
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm md:text-base">
            <li>
              Each API key is tied to a specific API client and company in
              BalloAds.
            </li>
            <li>
              For SMS sends, the sender ID is automatically taken from that
              company profile.
            </li>
            <li>
              Custom sender ID is not accepted in this endpoint payload.
            </li>
            <li>
              If the matched company has no sender ID configured, the request is
              rejected.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">
            Delivery and Credit Rules
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm md:text-base">
            <li>
              Only channels enabled for the API key can be used by that key.
            </li>
            <li>
              Active, non-expired credits are required for the target channel.
            </li>
            <li>
              Credits are deducted per successful recipient delivery.
            </li>
            <li>
              Failed recipient deliveries are logged and do not consume credits.
            </li>
            <li>
              Responses include per-recipient results, so a request can be
              partially successful.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">
            Request Example
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setActiveSample(option.key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold md:text-sm ${
                  activeSample === option.key
                    ? "bg-[var(--brand-color-1)] text-white"
                    : "bg-slate-100 text-[var(--dark-blue)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
            <code>{codeSamples[activeSample]}</code>
          </pre>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">
            Success Response
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
            <code>{sampleSuccessResponse}</code>
          </pre>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">Error Codes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm md:text-base">
            <li>
              <span className="font-semibold">400:</span> Bad request payload.
            </li>
            <li>
              <span className="font-semibold">401:</span> Missing or invalid API
              key.
            </li>
            <li>
              <span className="font-semibold">404:</span> Route not found in the
              target environment.
            </li>
            <li>
              <span className="font-semibold">500:</span> Internal server error.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">Best Practices</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm md:text-base">
            <li>Use test keys in QA and live keys only in production.</li>
            <li>Keep API keys on your server, never in browser code.</li>
            <li>Log request IDs to simplify support and debugging.</li>
            <li>Retry transient failures with exponential backoff.</li>
            <li>
              Contact BalloAds support to get access to the dashboard for API
              key management and credit administration.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
