# BalloAds CMS - Product Development Roadmap

This document outlines the strategic vision and development phases strictly for the **BalloAds CMS and Advertising Platform**.

---

## 🎯 Executive Summary
BalloAds CMS is an all-in-one advertising management system. It enables businesses to manage audience data via the Consumer Data Hub (CDH), launch multi-channel campaigns (SMS, USSD, Web), and use AI-driven tools to optimize message engagement.

---

## 📊 Development Phases & Status

### Phase 1: Current Development (MVP & Core Enhancements)
*Goal: Establish the foundation and modernize the user experience.*

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Consumer Data Hub (CDH)** | Dedicated database and API for consumer demographics & segmentation. | ✅ Completed |
| **OTP Infrastructure** | Secure multi-channel OTP (MTN, Tumani) for platform authentication. | ✅ Completed |
| **Campaign Management** | Core engine to start, pause, resume, and retarget ads. | ✅ Completed |
| **Link Masking & Tracking** | Backend service for tracking clicks and masking campaign URLs. | ✅ Completed |
| **Asset Management** | Integration with Minio for scalable media storage (icons, ad creative). | ✅ Completed |
| **FCM Notifications** | Real-time browser push notifications for platform events. | ✅ Completed |
| **Behavioral Segmentation** | Filtering audience by engagement (clicks, opens, active status). | 🚧 In Progress |
| **Interest-Based Targeting** | Granular user mapping (e.g., "digital banking", "real estate"). | 🚧 In Progress |
| **Canva-Style UI Refactor** | Overhauling the CMS interface to match a premium design system. | 🚧 In Progress |
| **Quick Ad Launch** | A 5-step wizard for rapid campaign deployment. | 🚧 In Progress |
| **Admin Backoffice** | Internal dashboard for campaign moderation and user management. | 🚧 In Progress |

---

### Phase 2: Future Roadmap (Scaling & Intelligence)
*Goal: Provide deep insights, AI automation, and advanced marketing tools.*

| Feature | Description | Status |
| :--- | :--- | :--- |
| **AI Message Assistant** | AI tool to suggest tailored content and tone for ad copy. | 📅 Pending |
| **Advanced Analytics** | Predictive trends, heatmaps, and deep demographic insights. | 📅 Pending |
| **In-app Messaging** | Real-time multi-media chat between users and businesses. | 📅 Pending |
| **A/B Testing Tools** | Compare different ad creatives and copy for ROI optimization. | 📅 Pending |
| **Feed & Updates** | Business feed for showcasing multi-media updates and stories. | 📅 Pending |
| **Customizable Templates** | Pre-built templates for promotions, product launches, etc. | 📅 Pending |
| **Social Integration** | Manage cross-platform social media ads from the CMS. | 📅 Pending |
| **Marketplace Gallery** | Business product showcases with direct-to-seller messaging. | 📅 Pending |
| **Gamification Engine** | Tools to create and embed interactive games on advertiser sites. | 📅 Pending |
| **Flow Triggers** | Automate messages based on user behavior triggers. | 📅 Pending |

---

## 🚀 Recent CMS Milestones
*   **Segmented Messaging**: Completed the logic for sending messages based on CDH demographics.
*   **Secure Dispatch**: Finalized the `CrmDispatchService` for automated campaign execution.
*   **Media Optimization**: Successfully migrated all notification and ad assets to Minio storage.
*   **Tracking Infrastructure**: Deployed the `LinkMaskingService` to track ROI across all channels.

---

## 🛠 Next Steps
1.  **UI Refactoring**: Finish the implementation of the new design language for the Home and Features pages.
2.  **AI Assistant Architecture**: Define the LLM integration for the AI Message Assistant.
3.  **Audience Refinement**: Enhance CDH filtering to support more granular interest-based targeting.

---

> [!IMPORTANT]
> This roadmap focuses exclusively on the CMS and Advertising platform. Trading or broker-related integrations are handled in their respective project repositories.
