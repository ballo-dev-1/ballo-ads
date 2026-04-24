"use client";

import { useAppStore } from "@/lib/crmStores";
import { CampaignModal } from "@/components/crm/campaigns/CampaignModal";
import { SegmentModal } from "@/components/crm/segments/SegmentModal";
import { JourneyModal } from "@/components/crm/journeys/JourneyModal";

export function ModalHost() {
  const active = useAppStore((state) => state.activeModal);
  if (!active) return null;
  if (active.id === "campaign") return <CampaignModal />;
  if (active.id === "segment") return <SegmentModal />;
  if (active.id === "journey") return <JourneyModal />;
  return null;
}
