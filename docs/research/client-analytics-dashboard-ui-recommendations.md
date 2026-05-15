# Client Analytics Dashboard UI Recommendations

```text
Document type: Research-derived UI reference
Product area: Agency Client Portal Aggregator
Focus: Client-facing analytics dashboard UI
Source basis: two supplied research syntheses about agency client reporting and analytics dashboards
Status: Reference for future dashboard design and UC-004 planning
Constraint: This document records only recommendations present in the supplied research.
```

## 1. Core UI Premise

The research consistently says that clients do not primarily want a marketing data dashboard. They want a business-value scoreboard that answers whether agency work is creating leads, calls, pipeline, sales, revenue, qualified opportunities, and what happens next.

The dashboard UI should therefore lead with client questions, not platform metrics.

The repeated client questions from the research are:

```text
Did marketing make me money?
Did we make any money?
Is the phone ringing?
Where did my money go?
What did I get?
Is my money being used well?
Are we on track?
Why did performance change?
What did the agency do?
What happens next?
What do you need from me?
Where is the dashboard or latest report?
```

The dashboard should combine:

```text
1. Outcome metrics
2. Performance explanation
3. Agency activity visibility
4. Client blockers
5. Trust signals
```

Outcome metrics named in the research:

```text
- leads
- qualified leads
- booked calls
- sales
- customers
- pipeline
- closed deals
- revenue
- revenue attributed
- CPL
- CPA
- CAC
- ROAS
- ROI
- conversion rate
- goal vs actual
- spend and budget pacing
```

Performance explanation named in the research:

```text
- what happened
- why it changed
- what it means
- what the agency did
- what is next
- honest explanation of bad months
```

Trust signals named in the research:

```text
- last updated timestamp
- data freshness
- source links
- data source labels
- manual / imported / integrated data mode
- data confidence
- goals vs actuals
- period-over-period comparisons
- source attribution
- attribution model disclosure
- known tracking caveats
```

## 2. Non-Negotiable UI Principles From Research

### 2.1 Summary First, Detail Later

The research recommends a "Summary First, Detail Later" pattern.

The client must understand the takeaway in under 10 to 30 seconds.

The executive read should appear before the analyst read.

Top-of-page UI should answer:

```text
- Is this working?
- Did we win or lose this month?
- Are we on track?
- What changed?
- What happens next?
- What needs client action?
```

Detailed tables, platform diagnostics, keyword lists, creative breakdowns, technical metrics, and raw data should be lower on the page or in an appendix / drill-down area.

### 2.2 Lead With Outcomes, Not Activity

The research says agencies over-report activity metrics and clients want outcomes.

Headline UI should prioritize:

```text
- conversions
- qualified leads
- booked calls
- revenue
- pipeline
- ROAS
- CPA / CPL / CAC
- conversion rate
- goal progress
- spend and budget pacing
```

Activity metrics should not be the main proof of value.

Metrics called out as weaker headline metrics:

```text
- impressions
- clicks
- followers
- likes
- raw pageviews
- raw traffic
- raw subscribers
- raw open rate
- reach without conversion context
```

### 2.3 No Number Without Narrative

The research explicitly recommends that numbers need narrative context.

The dashboard UI should include narrative fields:

```text
- executive summary
- what happened
- why it changed
- what we did
- what changed per channel
- insights and annotations
- next steps / recommendations
- client action items / blockers
```

The research says every report needs four narrative blocks:

```text
1. what happened
2. why it changed
3. what we did
4. what is next
```

The research also recommends forcing the following narrative fields to exist in the data structure:

```text
- executive_summary.narrative_md
- channels[].what_changed_md
- at least one insight
- at least one next_step
```

### 2.4 No Bare Numbers

The research says every metric should include context.

Every KPI card should include:

```text
- current value
- delta vs previous period
- goal, target, or benchmark
- status such as on track / behind / ahead
- source or definition where useful
```

The research states that the UI should not display a metric with no comparison as a primary KPI.

Every metric should pass the "compared to what?" test.

### 2.5 No Silent Staleness

The research says last-updated timestamps must always be visible.

The UI should show:

```text
- data last updated
- data source
- data mode
- data confidence
- known tracking caveats
```

If data is older than the configured freshness expectation, the research recommends an amber warning state.

### 2.6 Trust Is Structural, Not Stylistic

Trust-building features named in the research:

```text
- last-updated timestamps
- goals vs actuals progress bars
- period-over-period comparisons
- source attribution
- honest acknowledgment of bad months
- client-visible action items
- fallback states for unavailable dashboards
- open full dashboard links
- links to monthly summaries
```

The research says these matter more than chart aesthetics.

## 3. Recommended Page Information Architecture

The research contains two compatible dashboard information architecture lists. Both are recorded here.

### 3.1 Research IA Version A

Recommended top-to-bottom order:

```text
1. Header strip
2. Executive summary
3. Goal progress strip
4. Hero KPI row
5. Primary trend chart
6. Channel sections
7. What we did this month
8. Insights and annotations
9. Next steps / recommendations
10. Client action items / blockers
11. Appendix / drill-downs
```

#### 3.1.1 Header Strip

Purpose:

```text
- orient the client
- establish ownership
- establish freshness
```

Research recommends showing:

```text
- client logo
- agency logo / white-label branding
- reporting period selector
- Data last updated: [timestamp]
- account manager name
```

#### 3.1.2 Executive Summary

Purpose:

```text
- give the client the answer quickly
- explain the month in plain language
```

Research recommends:

```text
- 2-5 sentences of plain-language narrative written by the account manager
- one oversized hero number
- delta
- percent of goal / goal pacing
```

Example hero number pattern from the research:

```text
Revenue from marketing: $84,200 (+22% MoM, 112% of target)
```

#### 3.1.3 Goal Progress Strip

Purpose:

```text
- show contract attainment
- anchor performance against agreed expectations
```

Research recommends:

```text
- 1-3 contract goals
- horizontal progress bars
- semantic color
- on track / behind / ahead status
```

#### 3.1.4 Hero KPI Row

Purpose:

```text
- at-a-glance scoreboard
```

Research recommends:

```text
- 4-6 KPI cards
- current value
- delta vs prior period
- goal pacing
- sparkline
```

#### 3.1.5 Primary Trend Chart

Purpose:

```text
- show direction over time
- prevent overreaction to one noisy week or day
```

Research recommends:

```text
- single time-series of the headline outcome metric
- prior-period overlay
- annotations marking campaign events
- goal line where applicable
```

#### 3.1.6 Channel Sections

Purpose:

```text
- show which channel is driving results
- keep service detail separate from the executive summary
```

Research recommends channel sections as stacked, tabbed, or collapsible sections.

Named channels / services:

```text
- Paid Ads
- Google Ads
- Meta Ads
- SEO
- Social
- Organic Social
- Email/SMS
- Lead Generation
- CRO / Landing Pages
- Referral / Direct
```

Each channel section should include:

```text
- 3-4 channel-specific KPIs
- one supporting visual
- short what changed note
- one next action
```

#### 3.1.7 What We Did This Month

Purpose:

```text
- connect agency work to results
- justify the retainer
- answer what did the agency do
```

Research recommends showing:

```text
- work completed this period
- active work
- optimizations made
- tests launched
- assets delivered
- bulleted activity log curated by the agency
```

#### 3.1.8 Insights And Annotations

Purpose:

```text
- translate numbers into plain English
- explain notable spikes, drops, and decisions
```

Research recommends:

```text
- callout boxes
- inline chart annotations
- event annotations
- plain-language notes
```

The insight should cover:

```text
- what changed
- why it likely changed
- whether it is good, bad, or neutral
- what the agency will do next
```

#### 3.1.9 Next Steps / Recommendations

Purpose:

```text
- make reporting forward-looking
- show the agency plan
```

Research recommends:

```text
- 2-4 prioritized actions
- owner
- due date
- expected impact where available
```

#### 3.1.10 Client Action Items / Blockers

Purpose:

```text
- surface client decisions needed
- remove hidden blockers
- make responsibility visible
```

Research recommends highlighted amber callouts for:

```text
- approvals needed
- access needed
- assets needed
- missing offer details
- CRM / sales feedback needed
- decisions needed
```

#### 3.1.11 Appendix / Drill-Downs

Purpose:

```text
- provide detail for power users
- keep executive view focused
```

Research recommends hiding these lower on the page or behind "Show details":

```text
- sortable tables
- top campaigns
- top ads
- top pages
- top posts
- top keywords
- full campaign-level tables
- creative breakdowns
- per-keyword rankings
```

### 3.2 Research IA Version B

Recommended structure:

```text
1. Executive Summary
2. Business Outcome Scoreboard
3. Trend Over Time
4. Funnel View
5. Channel Breakdown
6. Service-Specific Detail Sections
7. What We Did
8. Insights / Why It Changed
9. Blockers / Needed From Client
10. Data Freshness / Source Status
```

#### 3.2.1 Executive Summary

Purpose:

```text
Give the client the answer in 30 seconds.
```

Research recommends including:

```text
- current status: on_track / needs_attention / blocked / waiting_client / paused
- reporting period
- 3-5 primary KPI cards
- short plain-language summary
- main win
- main issue
- next action
- needed from client
```

#### 3.2.2 Business Outcome Scoreboard

Purpose:

```text
Show whether marketing is creating business value.
```

Primary KPIs named:

```text
- leads
- qualified leads
- booked calls
- sales / customers
- revenue attributed
- pipeline value
- CPL / CPA / CAC
- ROAS / ROI
- conversion rate
- goal vs actual
```

#### 3.2.3 Trend Over Time

Purpose:

```text
Prevent clients from overreacting to one noisy week or one bad day.
```

Research recommends:

```text
- 3-month / 6-month trend
- month-over-month change
- goal line
- notes on major events
```

#### 3.2.4 Funnel View

Purpose:

```text
Show where performance is improving or leaking.
```

Example funnel from the research:

```text
Spend -> Clicks -> Visitors -> Leads -> Qualified Leads -> Booked Calls -> Sales -> Revenue
```

Another funnel expression from the research:

```text
Spend -> visitors/clicks -> leads -> qualified leads -> booked calls -> sales/revenue
```

#### 3.2.5 Channel Breakdown

Purpose:

```text
Show which channels are driving outcomes.
```

Channels named:

```text
- Google Ads
- Meta Ads
- SEO
- Organic social
- Email/SMS
- Referral/direct
- Landing pages/CRO
```

#### 3.2.6 Service-Specific Detail Sections

Purpose:

```text
Let the client drill down only if needed.
```

Each service section should include:

```text
- 3-6 key metrics
- one trend chart
- one performance table
- one insight / note
- one next action
```

#### 3.2.7 What We Did

Purpose:

```text
Connect agency work to results.
```

Research recommends showing:

```text
- work completed this period
- active work
- optimizations made
- tests launched
- assets delivered
```

#### 3.2.8 Insights / Why It Changed

Purpose:

```text
Make the agency look strategic, not just operational.
```

Research recommends showing:

```text
- what changed
- why it likely changed
- whether it is good / bad / neutral
- what the agency will do next
```

#### 3.2.9 Blockers / Needed From Client

Purpose:

```text
Make responsibility visible.
```

Research recommends showing:

```text
- missing access
- approval needed
- assets needed
- offer / landing page decision
- CRM / sales feedback needed
```

#### 3.2.10 Data Freshness / Source Status

Purpose:

```text
Build trust.
```

Research recommends showing:

```text
- last updated time
- data source
- manual / imported / integrated
- confidence level
- known tracking caveats
```

## 4. Recommended Dashboard Blocks

The following block definitions are recorded from the supplied research.

| Block | Purpose | Data required | Visualization | Client question answered |
| --- | --- | --- | --- | --- |
| Status header | Orient, brand, signal freshness | Logos, period, last-updated timestamp, AM contact | Banner strip | Is this current and whose dashboard is this? |
| Executive summary | The fast business-level answer / TL;DR | Status, period, summary, wins, issues, next actions, account-manager paragraph, hero number | Text block + oversized KPI / KPI cards | Did we win or lose this month? Is this working? |
| Goal progress bars / Goals vs Actual | Show contract attainment and performance against expectations | Goal target, current actual, percent complete, target date, status | Horizontal progress bar / bullet chart | Are we hitting what we agreed? Are we on track? |
| KPI card row / Primary KPI Cards | At-a-glance scoreboard | 4-6 or 3-5 primary metrics with current value, prior-period delta, goal pacing, sparkline, benchmark or definition | Card grid | Is each metric good or bad right now? What did I get? |
| Primary trend chart / Performance Trend | Show direction over time | Daily/weekly/monthly outcome metric, prior-period series, event annotations, goal line | Single-line chart with annotation pins / trend chart | Are things trending up or down, and when did it change? |
| Channel strips / Channel Breakdown | Per-service scorecard and channel comparison | Channel-level spend, results, conversions, CPA/CPL, ROAS, revenue/pipeline, note | Horizontal strip, tab, table, stacked bar | Which channel is driving results? Which channel works best? |
| Cross-channel mix | Budget allocation decision | Spend, conversions, CPA, ROAS per channel | Sortable comparison table or stacked bar | Where should I shift budget? |
| Funnel view | Show drop-off | Stage counts and conversion percentage between stages | 3-5 step funnel diagram / funnel chart | Where are leads getting stuck? Where are we losing people? |
| Campaign Performance Table | Identify winners and losers | Campaign name, spend, result, CPA, ROAS, status | Sortable table | What campaigns are working? |
| Top performers table | Show what is working concretely | Top 5-10 campaigns, ads, posts, pages, keywords | Sortable table with conditional formatting and thumbnails | What is working and what should we do more of? |
| Activity log / What We Did / Work Completed | Justify the retainer and show agency execution | Completed work, active work, tests, optimizations, assets, deliverables | Plain bulleted list, timeline, checklist, status icons | What did I pay you for this month? What did the agency do? |
| Current Focus | Show current agency priority | Active workstreams and focus areas | Short list/status cards | What are you working on now? |
| Insights & annotations / What Changed | Translate numbers to plain English | 3-5 contextual notes, KPI deltas, events, changes made, chart references | Callout boxes, inline arrows, annotation timeline | Why did that spike or drop happen? Why did performance change? |
| Next steps / recommendations / Next Actions | Forward-looking strategic plan | 2-4 prioritized actions, owner, due date, expected impact | Numbered list / checklist | What is the plan for next month? What happens next? |
| Client action items / blockers / Needed From Client | Surface client decisions needed | Approvals, assets, access, decisions, due dates, status | Amber checklist callout / action list | What do I need to do? What do you need from me? |
| Benchmarks | Contextualize performance | Industry or peer-cohort benchmark for each KPI | vs. industry badge or comparison column | Is my performance actually good? |
| Report Archive | Store historical summaries | Monthly reports, PDFs, links | Archive list | Where is the monthly report? |
| Data Freshness | Build confidence | Last updated, source, status, confidence | Small metadata badge | Can I trust this data? |
| Embedded Dashboard / Source Links | Provide external dashboard access | Looker Studio or external dashboard embed, public dashboard link, PDF/monthly report link | Embedded dashboard / buttons / links | Where is the dashboard or source? |
| Appendix / drill-down | Depth for power users | Full tables: keywords, audiences, ads, pages | Hidden tabs with sortable tables | Where do I see underlying detail? |

## 5. KPI Card UI Requirements

Research says KPI cards should not be "number + label" only.

KPI card UI should include:

```text
- metric name
- current value
- unit
- prior value
- delta absolute
- delta percent
- goal
- goal progress / goal pacing
- status: on track / behind / ahead
- sparkline data points
- plain-language definition for tooltip text
- optional source label
- optional benchmark
```

Research states the executive view should use:

```text
- 3-5 primary KPI cards in one recommendation
- 4-6 KPI cards in another recommendation
- 5-10 focused primary KPIs as an upper reporting guidance
```

Research also warns that dashboards exceeding 12 KPIs show lower engagement.

Primary KPI examples from the research:

```text
- Spend
- Leads
- Qualified leads
- Booked calls
- Sales / customers
- Revenue attributed
- Pipeline value
- CPL
- CPA
- CAC
- ROAS
- ROI
- Conversion rate
- Goal vs actual
- Spend vs budget
- Budget pacing
```

Secondary or drill-down KPI examples:

```text
- CTR
- CPC
- CPM
- impressions
- reach
- engagement
- bounce rate
- keyword position
- email open rate
- frequency
- quality score
- impression share
- view-through conversions
- audience demographics
- per-creative breakdowns
- per-keyword rankings
```

## 6. Chart And Visualization Recommendations

### 6.1 Trend Charts

Research recommends a primary trend chart for the headline outcome metric.

It should support:

```text
- daily, weekly, monthly, 3-month, or 6-month trend depending on reporting context
- current period
- previous period overlay
- month-over-month change
- goal line
- annotations for major events
- annotation pins for campaign events
```

Client questions answered:

```text
- Are things improving?
- Are things trending up or down?
- When did performance change?
- Why did that spike or drop happen?
```

### 6.2 Funnel

Research recommends funnel visualization for showing leakage and progression.

Named funnel stages:

```text
- Spend
- impressions
- clicks
- visitors
- leads
- qualified leads
- booked calls
- sales
- revenue
```

The funnel should answer:

```text
Where are leads getting stuck?
Where are we losing people?
```

### 6.3 Channel Breakdown

Research recommends channel breakdown using:

```text
- table
- bar chart
- stacked bar
- channel strip
- tabbed section
- collapsible section
```

Channel data named:

```text
- channel
- spend
- results
- conversions
- leads
- qualified leads
- booked calls
- sales
- revenue
- pipeline
- CPA
- CPL
- ROAS
- conversion rate
- note / summary
```

### 6.4 Goal Progress

Research recommends goal progress bars and goals vs actual.

Data:

```text
- target
- actual
- percent complete
- target date
- status
- note
```

Visualization:

```text
- horizontal progress bar
- bullet chart
- target marker
- semantic color
```

### 6.5 Top Performer Tables

Research recommends showing concrete top performers.

Examples:

```text
- top campaigns
- top ads
- top posts
- top landing pages
- top content
- top keywords
```

Visualization:

```text
- sortable table
- conditional formatting
- thumbnails or names where available
```

### 6.6 Callouts And Annotations

Research recommends narrative callouts and annotations:

```text
- insight callouts
- warning callouts
- positive callouts
- inline arrows
- annotation timeline
- chart event pins
```

Callouts should explain:

```text
- what changed
- why it changed
- whether it is good / bad / neutral
- what the agency will do next
```

## 7. Service-Specific UI Guidance

### 7.1 Paid Ads

North-star / primary metrics:

```text
- ROAS for e-commerce
- CPA / cost per conversion for lead generation
- total conversions
- revenue attributed
- spend
- leads / purchases
- qualified leads
- CPL
- CAC
- conversion rate
- budget pacing
- goal vs actual
```

Secondary metrics:

```text
- CTR
- CPC
- CPM
- impressions
- impression share
- frequency
- creative performance
- Event Match Quality
- search terms
- audience diagnostics
- placement diagnostics
```

Cuts / dimensions:

```text
- campaign
- ad group
- ad / creative
- device
- geography
- new vs returning customers
- attribution window
```

Avoid in client view:

```text
- raw impressions
- raw clicks
- paid-post likes
- average position
- raw ad platform tables
- too many campaign / ad set rows
- attribution detail without plain-language explanation
```

Activity log examples:

```text
- A/B tests run
- creatives launched with thumbnails
- negative keywords added
- audiences built
- bid strategy changes
- budget reallocations
```

Research example annotation:

```text
CPA spiked 18% in week 2 due to algorithm learning-phase reset after creative refresh - stabilizing now.
```

### 7.2 SEO

North-star / primary metrics:

```text
- organic conversions
- organic revenue
- pipeline from organic
- organic sessions segmented branded vs non-branded
- rankings on target terms
- organic traffic
- Google Search Console clicks
- Google Search Console impressions
- Google Search Console CTR
- average position
- top landing pages
- local visibility where relevant
- technical health summary
```

Secondary metrics:

```text
- backlinks
- referring-domain growth
- Domain Authority / Domain Rating
- authority metrics
- Core Web Vitals
- GA4 engagement rate
- crawl / indexing issues
- content published
- AI-search citations
```

Cuts / dimensions:

```text
- branded vs non-branded
- page cluster
- keyword theme
- device
- geography
```

Avoid:

```text
- Domain Authority / Domain Rating as a primary KPI
- raw keyword count
- raw backlink count
- GA4 bounce rate
- huge keyword tables
- technical SEO jargon
- "we published X posts" without traffic or conversion impact
```

Activity log examples:

```text
- content published with URLs
- on-page optimizations
- technical fixes
- backlinks earned
- internal links added
```

Research example annotation:

```text
Traffic dip in week 3 = Google Core Update; rankings stabilized by week 4.
```

### 7.3 Social Media

North-star / primary metrics:

```text
- engagement rate
- follower growth rate
- clicks / conversions to site if commercial intent exists
- leads / conversions from social
- website clicks
- CTR
- revenue / pipeline influenced where trackable
- high-intent engagement: saves, shares, meaningful comments, DMs
- audience quality
- goal vs actual
```

Secondary metrics:

```text
- reach
- impressions
- profile visits
- share of voice
- saves / shares
- video view-through rate
- follower growth
- top posts
- video watch time
```

Cuts / dimensions:

```text
- platform
- content type
- Reel vs carousel vs static
- top / bottom posts
- day / time
- paid vs organic
```

Avoid:

```text
- raw follower count alone
- total likes without engagement rate
- generic engagement without breakdown
- likes / followers as headline success
- platform screenshots without interpretation
```

Activity log examples:

```text
- posts published per platform
- Reels / Stories / Lives
- community management response volume
- hashtag updates
- UGC sourced
```

Research example annotation:

```text
Reels drove 4.2x more reach than static - shifting to 60% video next month.
```

### 7.4 Email / SMS

North-star / primary metrics:

```text
- revenue attributed to email/SMS
- campaign revenue
- flow / automation revenue
- revenue per recipient
- percent of total revenue from owned channels
- conversions
- CTR
- delivery rate
- unsubscribe / opt-out rate
- spam complaint rate
- list growth
- repeat purchase rate
```

Secondary metrics:

```text
- open rate
- click-to-open rate
- bounce rate
- segment performance
- campaign type performance
- send frequency
- list health
```

Cuts / dimensions:

```text
- campaign vs flow
- segment
- message type
- welcome
- browse-abandon
- cart-abandon
- win-back
- new vs repeat buyer
```

Avoid as primary:

```text
- open rate
- raw sends
- raw subscriber count
- deliverability details unless there is a problem
- showing every campaign without summarizing winners / losers
```

Activity log examples:

```text
- campaigns sent
- campaign name
- segment
- results
- new flows built
- subject line / CTA A/B tests
- segment updates
- deliverability work
```

Research example annotation:

```text
Welcome flow revenue +43% MoM after splitting subscribers by acquisition source.
```

### 7.5 Lead Generation

North-star / primary metrics:

```text
- qualified leads
- MQLs
- SQLs
- booked calls
- show-up rate
- lead-to-customer conversion rate
- pipeline value created
- total leads
- lead -> MQL rate
- MQL -> SQL rate
- SQL -> won rate
- speed to lead
- lead source attribution
- CAC
- lead velocity rate
- cost per qualified lead
- cost per booked call
- cost per acquisition
- closed-won revenue
```

Secondary metrics:

```text
- form conversion rate
- landing page conversion rate
- sales follow-up status
- lost / unqualified reasons
```

Cuts / dimensions:

```text
- source / channel
- campaign
- persona
- funnel stage
- TOFU / MOFU / BOFU
- rep
- new vs returning
```

Avoid as primary:

```text
- total impressions
- raw form fills without quality filter
- treating clicks as leads
- lead volume without quality
```

Activity log examples:

```text
- lead magnets created
- form optimization tests
- lead scoring rules adjusted
- new landing pages
- retargeting audiences
- CRM / automation workflows
```

Research example annotation:

```text
MQL->SQL gap of 8% (vs. 15% target) - sales feedback indicates Channel X leads need higher qualification threshold.
```

### 7.6 CRO / Landing Pages

North-star / primary metrics:

```text
- conversion rate overall
- conversion rate per page
- cumulative revenue lift from tests
- test win rate
- visitors
- leads / purchases / signups
- form starts
- form completions
- drop-off rate
- revenue per visitor
- conversion rate by traffic source
- test result / variant winner
```

Secondary metrics:

```text
- conversion rate by device
- conversion rate by source
- form completion rate
- LCP
- CTA CTR
- micro-conversions
- statistical significance
- bounce rate
- scroll depth
- click maps
- session recordings
- device breakdown
- page speed
```

Cuts / dimensions:

```text
- page / variant
- source
- device
- new vs returning
- audience segment
```

Avoid as primary:

```text
- raw traffic
- total pageviews
- generic time-on-site without context
- heatmap screenshots without insight
- technical UX notes without business impact
- universal benchmark obsession
```

Activity log examples:

```text
- tests launched
- hypothesis
- variant
- tests concluded
- winner
- lift
- confidence
- pages built / redesigned
- session-recording insights
- heuristic audits
```

Research example annotation:

```text
Variant B (single-column form) lifted CVR 22% at 95% confidence over 14 days - rolling out to 100% traffic.
```

### 7.7 Full-Service Agency Reporting

The research says to design for the CEO / CMO who has 30 seconds, not the analyst diagnosing for 30 minutes.

Recommended top-level metrics:

```text
- total marketing spend
- total leads
- qualified leads
- total revenue
- pipeline
- CAC
- CPA
- CPL
- ROAS
- ROI
- conversion rate
- channel contribution
- goal vs actual
- major wins / issues
- work completed
- next actions
- client blockers
```

Recommended full-service layout:

```text
1. One hero metric on top
2. 6-8 KPI tiles
3. Cross-channel comparison table
4. Per-channel drill-down sections in collapsible accordion
5. Activity-log roll-up
6. Recommendations
7. Action items
```

Hero metric depends on business model:

```text
- total marketing revenue
- blended ROAS
- pipeline
```

Per business-model variants:

```text
- E-commerce: ROAS, AOV, new-customer CAC
- SaaS: MQL, SQL, pipeline, MRR
- Local services: leads, calls, CPL, booked appointments
```

Critical disclosure:

```text
- attribution model used
```

Avoid:

```text
- separate disconnected reports per channel
- making the client mentally connect ads, SEO, CRM, and revenue
- showing internal agency chaos
```

## 8. Primary Vs Secondary Metric Placement

Research separates primary executive metrics from secondary drill-down metrics.

### 8.1 Always-Primary / Default Executive View

```text
- revenue attributed
- total revenue
- total qualified leads
- booked calls
- sales / customers
- ROAS
- blended ROAS
- total leads
- conversion rate
- total spend
- CAC
- CPA
- CPL
- goal pacing
- spend vs budget
- month-over-month trend on hero metric
- top performers
- activity log
- next steps
```

### 8.2 Secondary / Drill-Down

```text
- CTR
- CPC
- CPM
- impression share
- quality score
- frequency
- reach
- bounce rate
- time on page
- Domain Authority
- raw keyword count
- view-through conversions
- audience demographics
- per-creative breakdowns
- per-keyword rankings
- full campaign-level tables
```

## 9. UI Anti-Patterns To Avoid

The following anti-patterns are listed in the research.

### 9.1 Do Not Headline Vanity Metrics

Avoid as headline KPIs:

```text
- follower counts
- raw pageviews
- impressions in isolation
- raw email subscribers
- likes
- raw open rate
- reach without conversion context
```

The research says these should be hidden by default or surfaced only with conversion context.

### 9.2 Do Not Overwhelm With Too Many KPIs

Research warnings:

```text
- 25+ metrics on a page shuts the reader down
- dashboards exceeding 12 KPIs show lower engagement
- executive view should stay focused
- supporting metrics should be lower in the dashboard
```

### 9.3 Do Not Show Bare Numbers

Avoid metrics without:

```text
- delta
- comparison period
- goal
- benchmark
- source
- narrative explanation
```

### 9.4 Do Not Dump Raw Platform Data

Avoid default UI that looks like:

```text
- Google Ads raw tables
- Meta Ads Manager raw tables
- GA4 raw tables
- Google Search Console raw keyword dumps
- Klaviyo raw campaign lists
- CRM data dumps
```

### 9.5 Do Not Put Technical Metrics In The Executive View

Metrics named as too technical for executive view:

```text
- bounce rate
- impression share
- quality score
- view-through conversions
- attribution decay windows
- frequency
- share of voice
- last-non-direct-click model labels
```

### 9.6 Do Not Use Misleading Or Undefined Metrics

Research warnings:

```text
- define conversion explicitly
- form fills, qualified leads, and sales are not interchangeable
- "leads" can include spam form fills unless qualified
- platform-reported ROAS can overstate contribution
- attribution model and lag must be disclosed
```

### 9.7 Do Not Cherry-Pick Time Windows

Research recommends equivalent prior-period comparisons.

Avoid:

```text
- best-week vs worst-week comparisons
- selective reporting windows
- good-news-only summaries
```

### 9.8 Do Not Make Static PDFs The Only Delivery Format

Research says static PDFs cannot answer follow-up questions and create manual re-pulls.

### 9.9 Do Not Hide Last Updated

Research says lack of last-updated timestamp silently erodes trust.

### 9.10 Do Not Mix Audiences In One Dense Screen

Research warns against trying to serve:

```text
- executive
- marketing manager
- analyst
```

with one overloaded screen.

### 9.11 Do Not Hide Bad Performance

Research says bad months should be explained clearly.

Bad performance explanation should include:

```text
- what happened
- why it happened
- what the agency is changing
- what the client should expect next
```

### 9.12 Do Not Hide Agency Activity

Research says if no "what we did" log is visible, clients ask what they are paying for.

### 9.13 Do Not Use Misleading Charts

Avoid:

```text
- pie charts with more than 5 slices
- dual-axis line charts with mismatched scales
- 3D charts
- decorative red coloring that looks like a status alert
```

### 9.14 Do Not Require Too Many Filters Before Data Appears

Research warns against dashboards that require multiple dropdown selections before any data renders.

## 10. Manual Data Fields That Affect UI

The research recommends the following manual data fields before integrations.

### 10.1 Period Metadata

```json
{
  "client_id": "string",
  "period_start": "date",
  "period_end": "date",
  "status": "on_track | needs_attention | blocked | waiting_client | paused",
  "last_updated_at": "datetime",
  "data_mode": "manual | json_import | embedded_dashboard | integration",
  "data_confidence": "high | medium | low | estimated",
  "account_manager": "string",
  "agency_contact": "string",
  "attribution_note": "string"
}
```

### 10.2 Executive Summary

```json
{
  "executive_summary": "string",
  "main_win": "string",
  "main_issue": "string",
  "next_focus": "string",
  "hero_metric": {
    "label": "string",
    "value": "number|string",
    "unit": "string",
    "delta_abs": "number|string",
    "delta_pct": "number",
    "goal_pct": "number"
  }
}
```

### 10.3 KPI Cards

```json
{
  "kpi_cards": [
    {
      "id": "string",
      "name": "string",
      "value": "number|string",
      "unit": "string",
      "prior_value": "number|string",
      "delta_abs": "number|string",
      "delta_pct": "number",
      "goal": "number|string",
      "status": "on_track | behind | ahead",
      "sparkline": ["number"],
      "definition": "string",
      "source": "string"
    }
  ]
}
```

### 10.4 Goals

```json
{
  "goals": [
    {
      "name": "string",
      "metric": "string",
      "target": "number",
      "actual": "number",
      "target_date": "date",
      "status": "ahead | on_track | behind",
      "note": "string"
    }
  ]
}
```

### 10.5 Trends

```json
{
  "trends": [
    {
      "metric": "string",
      "granularity": "daily | weekly | monthly",
      "series": [
        { "date": "date", "value": "number" }
      ],
      "comparison_series": [
        { "date": "date", "value": "number" }
      ],
      "annotations": [
        { "date": "date", "label": "string" }
      ]
    }
  ]
}
```

### 10.6 Channel Breakdown

```json
{
  "channel_breakdown": [
    {
      "channel": "google_ads | meta_ads | seo | social | email_sms | direct | referral | other",
      "spend": "number",
      "leads": "number",
      "qualified_leads": "number",
      "booked_calls": "number",
      "sales": "number",
      "revenue": "number",
      "cpl": "number",
      "cpa": "number",
      "roas": "number",
      "conversion_rate": "number",
      "summary": "string"
    }
  ]
}
```

### 10.7 Service Sections

```json
{
  "service_sections": [
    {
      "service_type": "paid_ads | seo | social | email_sms | lead_generation | cro | cro_lp | full_service",
      "summary": "string",
      "metrics": {},
      "insights": ["string"],
      "next_actions": ["string"]
    }
  ]
}
```

### 10.8 Funnel

```json
{
  "funnel": {
    "impressions": "number",
    "clicks": "number",
    "visitors": "number",
    "leads": "number",
    "qualified_leads": "number",
    "booked_calls": "number",
    "sales": "number",
    "revenue": "number"
  }
}
```

### 10.9 Agency Work

```json
{
  "agency_work": {
    "completed": ["string"],
    "active": ["string"],
    "next": ["string"]
  }
}
```

### 10.10 Client Actions Needed

```json
{
  "client_actions_needed": [
    {
      "title": "string",
      "description": "string",
      "status": "pending | answered | resolved | cancelled",
      "due_date": "date",
      "related_link": "string"
    }
  ]
}
```

### 10.11 Source Links

```json
{
  "source_links": [
    {
      "name": "string",
      "provider": "looker_studio | agencyanalytics | databox | whatagraph | dashthis | swydo | reportgarden | oviond | custom",
      "embed_url": "string",
      "public_url": "string",
      "status": "active | inactive"
    }
  ]
}
```

### 10.12 Monthly Report

```json
{
  "monthly_report": {
    "summary": "string",
    "wins": ["string"],
    "problems": ["string"],
    "next_actions": ["string"],
    "client_decisions_needed": ["string"],
    "pdf_url": "string",
    "dashboard_url": "string"
  }
}
```

## 11. Integration-Related UI Priorities From Research

The research names the following future integration priorities:

```text
1. Google Ads + Meta Ads
2. GA4
3. CRM: HubSpot, Pipedrive, Salesforce, Close, GHL
4. Klaviyo / Mailchimp / Postscript / ActiveCampaign
5. Google Search Console + SEO rank tracker such as Ahrefs, Semrush, AgencyAnalytics
6. Looker Studio embed pass-through
7. Stripe / Shopify
8. Call tracking such as CallRail, WhatConverts
9. Data freshness / sync health
```

The UI implications named in the research:

```text
- show source labels
- show source status
- show sync health
- show last sync / last updated
- show confidence level
- show attribution caveats
- allow embedded dashboard links
- allow full dashboard links
```

## 12. Dashboard UI Completion Bar From Research

A dashboard UI aligned with the supplied research should contain these research-backed elements:

```text
- client / agency / period / freshness context
- executive summary
- hero number
- 3-6 primary KPI cards
- goals vs actual
- primary trend chart
- funnel view
- channel breakdown
- service-specific detail sections
- what changed / insights
- what we did / activity log
- next steps / recommendations
- needed from client / blockers
- source links / embedded dashboard links
- latest monthly report / archive link
- appendix / drill-down tables
- last updated timestamp
- source labels
- data confidence
- attribution note
```

## 13. Source Notes

This document is derived only from the two supplied research outputs:

```text
1. What Marketing Agency Clients Actually Want to See
2. Agency Client Analytics Dashboard Research
```

Named source categories in the research:

```text
- AgencyAnalytics benchmark and reporting guides
- Databox / ZenPilot agency-client collaboration research
- Whatagraph reporting research and templates
- Swydo reporting guidance
- Reddit agency/PPC/social reporting discussions
- Medium and business-owner complaints about agency reporting
- marketing reporting SaaS guides
- dashboard design guidance
- service-specific KPI sources for paid ads, SEO, social, email/SMS, lead generation, and CRO
```

This document intentionally does not add new UI recommendations beyond those research outputs.
