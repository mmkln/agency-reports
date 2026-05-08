# Agency Client Portal Aggregator — Project Brief

## 1. Project Name

```text
Agency Client Portal Aggregator
```

## 2. Short Description

The Agency Client Portal Aggregator is a simple client-facing portal for marketing agencies.

It gives each client one clear place to see:

```text
- what the agency is working on
- what progress has been made
- which tasks are active
- what is blocked
- what results are coming from marketing campaigns
- what the agency needs from the client
- where to find the latest dashboard and monthly report
```

This project is not a replacement for tools like AgencyAnalytics, Whatagraph, Databox, DashThis, Swydo, ReportGarden, Oviond, Looker Studio, ClickUp, Google Drive, Google Ads, Meta Ads, GA4, GHL, Make, or n8n.

It is a branded portal layer that organizes the client-facing experience above those tools.

---

## 3. Why This Project Exists

Marketing agencies often work across many disconnected tools:

```text
- task/project tools
- ad platforms
- analytics platforms
- CRM systems
- reporting tools
- file storage
- automation tools
- spreadsheets
- client communication channels
```

This creates a communication gap for clients.

Clients often do not know:

```text
- what is currently being worked on
- whether the agency is making progress
- what has been completed
- what is waiting on them
- where to find the latest report
- how marketing performance connects to the agency’s work
```

Agencies also waste time repeatedly answering status questions, preparing manual updates, sharing links, explaining dashboards, and writing monthly summaries.

This project exists to reduce that communication friction.

The goal is to make agency-client communication clearer, more structured, and less dependent on scattered chats, calls, spreadsheets, and disconnected links.

---

## 4. Core Problem

The core problem is not that agencies lack tools.

The core problem is that clients do not have one simple place to understand the current state of the agency relationship.

Existing reporting platforms are mostly built around data connectors, dashboards, templates, branded reports, and scheduled reporting. AgencyAnalytics, for example, positions itself around automated client reporting, dashboards, reusable templates, and agency client portals. ([AgencyAnalytics][1])

Whatagraph similarly focuses on connecting marketing channels, centralizing reporting, and sharing results. ([Whatagraph][2])

Looker Studio already supports embedding reports into websites and apps through iframes, which means the MVP does not need to build its own analytics engine first. ([Google Cloud Documentation][3])

Therefore, the first version should not try to rebuild analytics infrastructure.

It should solve the client-facing clarity problem.

---

## 5. Core Product Idea

```text
External tools generate the data.
The portal organizes the client-facing experience.
```

The portal should collect and display:

```text
- project status
- client-visible tasks
- latest agency updates
- needed client actions
- embedded marketing dashboards
- monthly report summaries
- important links and files
```

The portal should not calculate complex marketing analytics in V1.

The portal should not replace the agency’s internal project management system.

The portal should not become a full BI platform.

The portal should not become a chat system, billing system, or CRM.

---

## 6. Target Users

## Primary User: Marketing Agency Owner

Needs:

```text
- reduce repetitive client status communication
- make the agency look more professional
- give clients visibility without exposing internal chaos
- centralize progress, reports, and dashboards
- avoid rebuilding reporting manually every month
```

## Secondary User: Account Manager / Agency Team

Needs:

```text
- update client-facing progress
- show what is currently being worked on
- mark blockers
- publish monthly summaries
- keep the client aligned
```

## Client User

Needs:

```text
- quickly understand what the agency is doing
- see progress without asking in chat
- view the marketing dashboard
- read the latest monthly summary
- know what the agency needs from them
```

---

## 7. What The Portal Must Answer

The portal must answer these client questions:

```text
1. What are you doing for me?
2. What has already been completed?
3. What is currently active?
4. What is blocked?
5. What results are we getting?
6. What do you need from me?
7. Where is my dashboard or latest report?
```

If the client can answer these questions without messaging the agency, the product is doing its job.

---

## 8. Product Positioning

The Agency Client Portal Aggregator is positioned as:

```text
A branded client-facing operating portal for marketing agencies.
```

It is not positioned as:

```text
- an AgencyAnalytics clone
- a Whatagraph clone
- a Databox clone
- a full project management tool
- a native analytics platform
- a reporting automation platform
- a CRM
- a file storage system
- a client chat system
```

It sits between the agency and the client as a simple presentation layer.

---

## 9. Relationship With Existing Tools

## External Tools Keep Their Jobs

```text
Looker Studio / AgencyAnalytics / Databox / Whatagraph:
marketing dashboards and reports

Google Ads / Meta Ads / GA4:
raw marketing performance data

GHL / HubSpot / CRM:
leads, opportunities, bookings, pipeline data

Google Drive:
files, folders, reports, creative assets

Make / n8n:
automation and data movement

ClickUp / Asana / Trello:
internal project management

Google Docs / Slides:
monthly report documents and PDFs
```

## The Portal’s Job

```text
- show the right external links in one place
- embed the right dashboards
- summarize current progress
- show client-visible tasks
- show what is needed from the client
- organize monthly summaries
- make the agency-client relationship easier to understand
```

---

## 10. Product Philosophy

The project should follow these principles:

```text
clarity > automation
client understanding > internal complexity
manual updates > premature integrations
embedded dashboards > custom BI
monthly summaries > real-time analytics
client-visible progress > full project management
focused portal > all-in-one platform
```

The first version should be intentionally simple.

The portal should feel useful even if most data is entered manually.

Automation should be added only after the agency has repeated the same workflow several times and knows what is actually worth automating.

---

## 11. MVP Hypothesis

The MVP hypothesis:

```text
Marketing agency clients will value a simple branded portal where they can see progress, active work, marketing results, monthly summaries, and needed actions in one place.
```

The MVP does not need to prove that the agency can build a full analytics platform.

The MVP needs to prove that clients value one organized view of the agency relationship.

---

## 12. MVP Scope

The MVP should include:

```text
- client login
- client-specific access
- client overview page
- project progress
- client-visible tasks
- latest agency update
- needed from client section
- embedded dashboard
- monthly summary / report archive
- basic agency admin
```

The MVP should not include:

```text
- native Google Ads connector
- native Meta Ads connector
- native GA4 connector
- native GHL connector
- custom dashboard builder
- native BI system
- full project management system
- chat system
- billing system
- mobile app
- AI insights engine
- complex attribution engine
- real-time analytics
```

This matches the MVP scope and sacrifice rules already defined in the development reference document. 

---

## 13. Essential Client Experience

The client should log in and immediately see:

```text
Status:
On track / needs attention / blocked / waiting client

Current Focus:
What the agency is working on now

Progress:
High-level project or campaign progress

Active Tasks:
Only client-visible tasks

Latest Update:
Short written agency update

Needed From Client:
Approvals, access, assets, decisions, feedback

Marketing Dashboard:
Embedded Looker Studio or external dashboard

Latest Monthly Summary:
Human-written report summary and link
```

The Client Overview page is the most important page because it should help the client understand the current state in less than 30 seconds. 

---

## 14. Why Not Build A Full Reporting Platform First

A full reporting platform requires:

```text
- native ad platform connectors
- OAuth flows
- API quotas
- data normalization
- sync logs
- historical data storage
- metric definitions
- dashboard builder
- permissions
- data QA
- report scheduling
- alerting
```

This is too much for the first version.

Existing tools already solve large parts of the reporting problem.

The MVP should use embedded dashboards first, especially because Looker Studio supports iframe embedding. ([Google Cloud Documentation][3])

The first version should focus on the gap that reporting tools do not fully solve for a small agency: making project progress, agency work, dashboards, summaries, and client-needed actions visible in one branded portal.

---

## 15. Why Monthly Summary Matters

Dashboards show data.

Monthly summaries explain what the data means.

Clients usually need more than raw charts.

They need to understand:

```text
- what changed
- what worked
- what did not work
- what the agency did
- what the agency will do next
- what decision is needed from the client
```

Swydo positions reporting around helping online marketers save time and show impact through reports and dashboards clients can understand. ([Swydo][4])

For the MVP, the summary should be written manually.

AI-generated insights should not be part of the first version.

---

## 16. What Makes This Project Valuable

The project creates value by reducing client confusion.

It helps agencies:

```text
- reduce repetitive status questions
- make progress visible
- organize reporting links
- keep client-needed actions visible
- make monthly reporting easier
- improve perceived professionalism
- avoid scattered communication
```

It helps clients:

```text
- understand what is happening
- see what has been done
- access reports and dashboards
- know what is needed from them
- feel that the agency is organized
- reduce uncertainty about agency work
```

---

## 17. Success Criteria

The project is successful if:

```text
1. The agency can create a client portal manually.
2. The client can log in securely.
3. The client can only see their own data.
4. The agency can add progress manually.
5. The agency can add client-visible tasks.
6. The agency can add a latest update.
7. The agency can show what is needed from the client.
8. The agency can embed a marketing dashboard.
9. The agency can publish a monthly summary.
10. The client can understand progress, results, and next actions without asking in chat.
```

These success criteria match the defined MVP success criteria in the development reference document. 

---

## 18. Non-Goals

The project should not try to solve these problems in V1:

```text
- advanced marketing analytics
- native ad data ingestion
- attribution modeling
- real-time reporting
- full client communication
- internal team workload management
- project planning
- media buying optimization
- creative approval workflows
- billing and invoices
- CRM management
- file storage
```

These may become future modules only if repeated real usage proves that they are necessary.

---

## 19. Future Direction

If the portal proves useful, future versions can add:

```text
- files and links module
- approval requests
- email notifications
- client activity tracking
- basic KPI cards inside portal
- PDF generation
- client comments
- simple branding
- native Google Ads connector
- native Meta Ads connector
- GA4 connector
- GHL connector
- sync logs
- alerts
- AI draft summaries
```

But these should be added only after the core portal is used by real clients.

---

## 20. Core Strategic Decision

The project should begin as a simple portal, not a platform.

The correct first version is:

```text
Client Overview
+ Progress / Tasks
+ Needed From Client
+ Embedded Dashboard
+ Monthly Summary
```

The wrong first version is:

```text
AgencyAnalytics clone
+ ClickUp clone
+ Google Ads connector
+ Meta Ads connector
+ custom dashboard builder
+ AI insights engine
+ chat
+ billing
```

The first product must validate the client-facing workflow before investing in deep automation.

---

## 21. One-Sentence Definition

```text
Agency Client Portal Aggregator is a branded client portal that gives marketing agency clients one simple place to understand current work, project progress, marketing results, monthly summaries, and actions needed from them.
```

---

## 22. Product North Star

```text
Make every client feel:
“I know what the agency is doing, what progress has been made, what results we are getting, and what I need to do next.”
```

[1]: https://agencyanalytics.com/?utm_source=chatgpt.com "AgencyAnalytics: Automated Client Reporting for Marketing ..."
[2]: https://whatagraph.com/?utm_source=chatgpt.com "Whatagraph: Marketing Intelligence Platform - Reporting ..."
[3]: https://docs.cloud.google.com/data-studio/embed-a-report?utm_source=chatgpt.com "Embed a report | Data Studio"
[4]: https://www.swydo.com/?utm_source=chatgpt.com "Swydo: Automated Marketing Reporting and Monitoring Platform"
