# Dental Growth Dashboard Metrics Spec

## 0. Purpose

This document defines the calculation logic for core Dental Growth Dashboard metrics.

The dashboard should calculate metrics from normalized local database tables, not directly from external APIs on page load.

```text
External sources
→ sync layer
→ normalized DB
→ metric calculation service
→ cached metric values / chart series
→ frontend dashboard
```

---

## 1. Shared Calculation Rules

### 1.1 Timezone

All date grouping must use the clinic/workspace timezone.

```text
DATE(timestamp AT TIME ZONE clinic_timezone)
```

### 1.2 Period Boundaries

Use inclusive start and exclusive end.

```text
timestamp >= period_start
timestamp < period_end_exclusive
```

### 1.3 Zero Fill

Every daily chart must include all dates in the selected period, even if value is `0`.

### 1.4 Data Freshness

Every metric response should include:

```text
source
last_synced_at
confidence
calculation_note
```

### 1.5 Status Normalization

Normalize raw GHL appointment statuses.

```text
GHL New       → booked
GHL Confirmed → confirmed
GHL Showed    → attended
GHL No-show   → no_show
GHL Cancelled → cancelled
GHL Invalid   → invalid
```

### 1.6 Main Date Fields

```text
Booked Appointments     → booked_at / GHL dateAdded
Attended Appointments   → appointment_start_at / GHL startTime
Show Rate               → appointment_start_at / GHL startTime
Opportunities Created   → opportunity_created_at / GHL dateAdded / createdAt
Projected Revenue       → booked_at / GHL dateAdded
Marketing Cost          → cost_date / allocated date
Lead to Booked %        → lead_created_at / opportunity_created_at
```

---

## 2. Metric Registry

| Metric                           | Business Question                                             | Date Field                       | Formula                                                                  | Chart Type           |
| -------------------------------- | ------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ | -------------------- |
| Booked Appointments by Day       | How many appointment bookings were created?                   | `booked_at`                      | count eligible appointments booked in period                             | Daily bar            |
| Attended Appointments by Day     | How many scheduled appointments were attended?                | `appointment_start_at`           | count attended appointments dated in period                              | Daily bar            |
| Show Rate / Attended of Booked   | What % of scheduled appointments were attended?               | `appointment_start_at`           | attended ÷ eligible scheduled appointments                               | Combo / line         |
| Opportunities Created by Day     | How many opportunities were created in the selected pipeline? | `opportunity_created_at`         | count opportunities created in period                                    | Daily bar            |
| Projected 90-Day Revenue         | What future revenue may this period’s bookings generate?      | `booked_at`                      | bookings × estimated show rate × avg 90-day revenue per attended patient | Daily bar / range    |
| Total Marketing Investment       | How much was invested into marketing/growth?                  | mixed cost dates                 | ad spend + prorated retainer + labor + software                          | Stacked daily bar    |
| Cost Per New/Reactivated Patient | How much did one real new/reactivated patient cost?           | cost date + attended date        | total investment ÷ new/reactivated attended patients                     | Period / cumulative  |
| Cost Per Booking                 | How much did one booking cost?                                | cost date + `booked_at`          | total investment ÷ eligible bookings                                     | Daily / cumulative   |
| LTV:CAC Ratio                    | Is acquisition economically healthy?                          | selected period + historical LTV | avg patient LTV ÷ blended CAC                                            | Weekly/monthly trend |
| Lead to Booked %                 | What % of leads became booked?                                | `lead_created_at`                | booked leads from cohort ÷ leads created                                 | Cohort line/bar      |

---

# 3. Metric Definitions

## 3.1 Booked Appointments by Day

### Definition

Count of appointments created/booked during the selected period.

### Business Question

```text
How many appointment bookings did we generate each day?
```

### Date Field

```text
booked_at = GHL appointment.dateAdded
```

### Formula

```text
Booked Appointments =
count(appointments)
where booked_at is inside selected period
and normalized_status not in cancelled / invalid
```

### SQL

```sql
SELECT
  DATE(booked_at AT TIME ZONE :clinic_timezone) AS day,
  COUNT(*) AS booked_count
FROM appointments
WHERE client_id = :client_id
  AND booked_at >= :period_start
  AND booked_at < :period_end_exclusive
  AND normalized_status NOT IN ('cancelled', 'invalid')
GROUP BY day
ORDER BY day;
```

### Notes

```text
This is a booking creation chart.
If an appointment was booked on May 29 for June 5, it counts on May 29.
Do not use appointment_start_at for this metric.
```

---

## 3.2 Attended Appointments by Day

### Definition

Count of appointments scheduled for the selected period that were marked as attended/showed/completed.

### Business Question

```text
How many scheduled appointments actually happened each day?
```

### Date Field

```text
appointment_start_at = GHL appointment.startTime
```

### Formula

```text
Attended Appointments =
count(appointments)
where appointment_start_at is inside selected period
and normalized_status = attended
```

### SQL

```sql
SELECT
  DATE(appointment_start_at AT TIME ZONE :clinic_timezone) AS day,
  COUNT(*) AS attended_count
FROM appointments
WHERE client_id = :client_id
  AND appointment_start_at >= :period_start
  AND appointment_start_at < :period_end_exclusive
  AND normalized_status = 'attended'
GROUP BY day
ORDER BY day;
```

### Notes

```text
If the appointment happened on May 10 but was marked Showed on May 11,
it still counts on May 10.
Do not group by status_updated_at.
Do not group by booked_at.
```

---

## 3.3 Show Rate / Attended of Booked

### Definition

Percentage of eligible scheduled appointments that were attended.

### Business Question

```text
Of the appointments scheduled for this day/period, how many actually attended?
```

### Date Field

```text
appointment_start_at
```

Use the same date field for numerator and denominator.

### Formula

```text
Show Rate =
attended appointments dated in period
÷
eligible scheduled appointments dated in period
```

### Eligible Scheduled Appointments

```text
appointments with appointment_start_at inside period
and normalized_status in booked / confirmed / attended / no_show
excluding cancelled / invalid
```

### SQL

```sql
SELECT
  DATE(appointment_start_at AT TIME ZONE :clinic_timezone) AS day,

  COUNT(*) FILTER (
    WHERE normalized_status = 'attended'
  ) AS attended_count,

  COUNT(*) FILTER (
    WHERE normalized_status IN ('booked', 'confirmed', 'attended', 'no_show')
  ) AS eligible_scheduled_count,

  COUNT(*) FILTER (
    WHERE normalized_status = 'no_show'
  ) AS no_show_count,

  COUNT(*) FILTER (
    WHERE normalized_status IN ('booked', 'confirmed')
      AND appointment_start_at < NOW()
  ) AS not_marked_count

FROM appointments
WHERE client_id = :client_id
  AND appointment_start_at >= :period_start
  AND appointment_start_at < :period_end_exclusive
  AND normalized_status NOT IN ('cancelled', 'invalid')
GROUP BY day
ORDER BY day;
```

### Output

```json
{
  "date": "2026-05-01",
  "scheduled": 10,
  "attended": 8,
  "no_show": 1,
  "not_marked": 1,
  "show_rate": 0.8
}
```

### Notes

```text
Do not calculate as attended by startTime ÷ booked by dateAdded.
That mixes different cohorts.
```

---

## 3.4 Opportunities Created by Day

### Definition

Count of opportunities created in the selected GHL pipeline during the selected period.

### Business Question

```text
How many new opportunities entered the selected pipeline each day?
```

### Date Field

```text
opportunity_created_at = GHL opportunity dateAdded / createdAt
```

### Formula

```text
Opportunities Created =
count(opportunities)
where opportunity_created_at is inside selected period
and pipeline_id = selected_pipeline
```

### SQL

```sql
SELECT
  DATE(opportunity_created_at AT TIME ZONE :clinic_timezone) AS day,
  COUNT(*) AS opportunity_count
FROM crm_opportunities
WHERE client_id = :client_id
  AND pipeline_external_id = :pipeline_id
  AND opportunity_created_at >= :period_start
  AND opportunity_created_at < :period_end_exclusive
GROUP BY day
ORDER BY day;
```

### Optional Split

```text
current_status
current_stage
source
channel
```

### Notes

```text
Do not use updated_at.
Do not use stage_changed_at for this metric.
If measuring movement into a stage, create a separate Opportunity Stage Movement metric.
```

---

## 3.5 Projected 90-Day Revenue

### UI Name

```text
Projected 90-Day Revenue
```

Do not call this `Revenue Attributed`.

### Definition

Estimated 90-day revenue expected from appointments booked during the selected period.

### Business Question

```text
What future value may this period’s bookings create?
```

### Date Field

```text
booked_at = GHL appointment.dateAdded
```

### Primary Formula

```text
Projected 90-Day Revenue =
eligible bookings
× estimated show rate
× avg 90-day revenue per attended patient
```

### Example

```text
12 bookings
× 70% estimated show rate
× $1,000 avg 90-day revenue per attended patient
=
$8,400 projected
```

### Alternative Formula

Use this if the 90-day revenue average is not available.

```text
Projected 90-Day Revenue =
eligible bookings
× estimated show rate
× (
  avg first-visit revenue
  + estimated treatment acceptance rate × avg accepted treatment value
)
```

### Daily Formula

```text
daily_projected_revenue =
bookings_created_that_day
× estimated_show_rate
× avg_90_day_revenue_per_attended_patient
```

### SQL

```sql
SELECT
  DATE(booked_at AT TIME ZONE :clinic_timezone) AS day,
  COUNT(*) AS eligible_bookings,
  COUNT(*) * :estimated_show_rate * :avg_90_day_revenue_per_attended_patient
    AS projected_90_day_revenue
FROM appointments
WHERE client_id = :client_id
  AND booked_at >= :period_start
  AND booked_at < :period_end_exclusive
  AND normalized_status NOT IN ('cancelled', 'invalid')
GROUP BY day
ORDER BY day;
```

### Recommended Display

```text
Projected 90-day revenue:
$7.1K–$9.6K
Median: $8.4K
Confidence: Medium
```

### Notes

```text
This is an estimate, not actual revenue.
Use range if possible.
Show assumptions in tooltip.
Actual attributed revenue requires mapping GHL booking → Dentrix patient → actual revenue.
```

---

## 3.6 Total Marketing Investment

### Definition

Total direct marketing/growth cost allocated to the selected period.

### Business Question

```text
How much did we invest into marketing/growth this period?
```

### Formula

```text
Total Marketing Investment =
Ad Spend
+ Roman retainer pro-rated
+ Brooke campaign labor
+ GHL/software pro-rated
+ other direct campaign/growth costs
```

### Date Logic

```text
Ad spend  → spend_date
Labor     → work_date
Retainer  → daily pro-rated allocation
Software  → daily pro-rated allocation
Other     → cost_date or allocated date
```

### Daily Formula

```text
daily_total_cost =
daily_ad_spend
+ daily_roman_retainer
+ daily_brooke_labor
+ daily_software
+ daily_other
```

### SQL

```sql
SELECT
  cost_date AS day,
  SUM(amount) FILTER (WHERE cost_type = 'ad_spend') AS ad_spend,
  SUM(amount) FILTER (WHERE cost_type = 'roman_retainer') AS roman_retainer,
  SUM(amount) FILTER (WHERE cost_type = 'brooke_labor') AS brooke_labor,
  SUM(amount) FILTER (WHERE cost_type = 'software') AS software,
  SUM(amount) FILTER (WHERE cost_type = 'other') AS other,
  SUM(amount) AS total
FROM marketing_cost_items
WHERE client_id = :client_id
  AND cost_date >= :period_start
  AND cost_date < :period_end_exclusive
  AND included_in_marketing_investment = true
GROUP BY cost_date
ORDER BY cost_date;
```

### Retainer Allocation

```text
daily_retainer_cost = monthly_retainer / days_in_month

period_retainer_cost =
monthly_retainer × selected_period_days / days_in_month
```

### Software Allocation

```text
daily_software_cost = monthly_software_cost / days_in_month
```

### Notes

```text
Do not use invoice date as the main chart date.
Use cost allocation by day.
Do not include general agency overhead unless explicitly allocated.
```

---

## 3.7 Cost Per New/Reactivated Patient — Blended

### Definition

All-in marketing investment divided by real new and reactivated attended patients.

### Business Question

```text
How much did one real new/reactivated patient cost?
```

### Formula

```text
Cost Per New/Reactivated Patient =
Total Marketing Investment
÷
(New Patients + Reactivated Patients)
```

### Denominator

```text
new/reactivated patients with attended appointment
```

### Date Logic

```text
Cost     → cost_date / allocated daily cost
Patients → appointment_start_at / first_visit_date, attended only
```

### SQL

```sql
WITH period_cost AS (
  SELECT SUM(amount) AS total_cost
  FROM marketing_cost_items
  WHERE client_id = :client_id
    AND cost_date >= :period_start
    AND cost_date < :period_end_exclusive
    AND included_in_marketing_investment = true
),

period_patients AS (
  SELECT
    COUNT(*) FILTER (WHERE patient_status = 'new') AS new_patients,
    COUNT(*) FILTER (WHERE patient_status = 'reactivated') AS reactivated_patients
  FROM appointments
  WHERE client_id = :client_id
    AND appointment_start_at >= :period_start
    AND appointment_start_at < :period_end_exclusive
    AND normalized_status = 'attended'
)

SELECT
  total_cost,
  new_patients,
  reactivated_patients,
  total_cost / NULLIF(new_patients + reactivated_patients, 0)
    AS cost_per_new_reactivated_patient
FROM period_cost, period_patients;
```

### Notes

```text
Do not call total cost ÷ bookings “Cost Per New Patient”.
That is Cost Per Booking.
```

---

## 3.8 Cost Per Booking

### Definition

All-in marketing investment divided by eligible bookings created in the period.

### Business Question

```text
How much did one booking cost?
```

### Formula

```text
Cost Per Booking =
Total Marketing Investment
÷
Eligible Bookings Created in Period
```

### Date Logic

```text
Cost     → cost_date / allocated daily cost
Bookings → booked_at / GHL dateAdded
```

### Daily Formula

```text
daily_cost_per_booking =
daily_total_marketing_investment
÷
daily_eligible_bookings_created
```

### SQL

```sql
WITH daily_cost AS (
  SELECT
    cost_date AS day,
    SUM(amount) AS total_cost
  FROM marketing_cost_items
  WHERE client_id = :client_id
    AND cost_date >= :period_start
    AND cost_date < :period_end_exclusive
    AND included_in_marketing_investment = true
  GROUP BY cost_date
),

daily_bookings AS (
  SELECT
    DATE(booked_at AT TIME ZONE :clinic_timezone) AS day,
    COUNT(*) AS eligible_bookings
  FROM appointments
  WHERE client_id = :client_id
    AND booked_at >= :period_start
    AND booked_at < :period_end_exclusive
    AND normalized_status NOT IN ('cancelled', 'invalid')
  GROUP BY day
)

SELECT
  d.day,
  COALESCE(c.total_cost, 0) AS total_cost,
  COALESCE(b.eligible_bookings, 0) AS eligible_bookings,
  CASE
    WHEN COALESCE(b.eligible_bookings, 0) = 0 THEN NULL
    ELSE c.total_cost / b.eligible_bookings
  END AS cost_per_booking
FROM calendar_days d
LEFT JOIN daily_cost c ON c.day = d.day
LEFT JOIN daily_bookings b ON b.day = d.day
ORDER BY d.day;
```

### Channel Split

```text
Channel Cost Per Booking =
channel direct cost
÷
bookings attributed to channel
```

### Shared Cost Allocation

For MVP:

```text
Keep shared costs in blended all-in cost.
Do not allocate Roman/GHL/software by channel unless explicit tags exist.
```

Allowed later methods:

```text
manual labor tags
campaign tags
allocation by bookings
allocation by spend
```

If allocated by assumption, mark confidence as low/medium.

---

## 3.9 LTV:CAC Ratio

### Definition

Average patient lifetime value divided by blended acquisition cost.

### Business Question

```text
For every $1 spent on acquisition, how much lifetime value is generated?
```

### Formula

```text
LTV:CAC Ratio =
Average Patient LTV
÷
Blended CAC
```

Where:

```text
Blended CAC =
Total Marketing Investment
÷
(New Patients + Reactivated Patients)
```

### Example

```text
Average Patient LTV: $2,400
Blended CAC: $326

LTV:CAC = 2400 / 326 = 7.36
Display: 7.4:1
```

### LTV Calculation Options

MVP:

```text
Avg Patient LTV =
avg revenue per visit
× visits per year
× average years with practice
```

Better:

```text
Avg Patient LTV =
average historical cohort revenue per patient from Dentrix
```

Best:

```text
Avg Patient Gross Profit LTV =
average historical patient revenue
× gross margin
```

### Chart Logic

Do not use raw daily bars.

Use:

```text
period-to-date line
weekly trend
monthly trend
bi-weekly review trend
```

### Period-to-Date Formula

```text
cumulative_ltv_cac_to_day =
avg_patient_ltv
÷
(cumulative_total_investment_to_day
 ÷ cumulative_new_reactivated_patients_to_day)
```

### Notes

```text
LTV:CAC is strategic, not operational.
Do not confuse 90-day projected revenue with lifetime value.
```

---

## 3.10 Lead to Booked %

### Definition

Percentage of leads/opportunities created in the selected period that reached Booked stage or had a linked appointment booking.

### Business Question

```text
What percentage of leads became booked?
```

### Date Field

```text
lead_created_at / opportunity_created_at
```

### Formula

```text
Lead to Booked % =
booked leads from selected-period cohort
÷
total leads created in selected period
× 100
```

### MVP Definition of Booked

```text
booked =
opportunity reached Booked stage or later
```

### Better Definition of Booked

```text
booked =
lead/contact has linked appointment booking
within X days after lead_created_at
```

### Recommended Maturation Window

```text
7 days configurable
```

### Daily Chart

Group by lead-created date.

```text
daily_lead_to_booked_rate =
leads created that day that eventually booked
÷
leads created that day
```

### SQL Concept

```sql
WITH lead_cohort AS (
  SELECT
    DATE(opportunity_created_at AT TIME ZONE :clinic_timezone) AS day,
    id AS opportunity_id,
    contact_external_id,
    stage_external_id,
    stage_order
  FROM crm_opportunities
  WHERE client_id = :client_id
    AND pipeline_external_id = :pipeline_id
    AND opportunity_created_at >= :period_start
    AND opportunity_created_at < :period_end_exclusive
),

daily_counts AS (
  SELECT
    day,
    COUNT(*) AS leads_created,
    COUNT(*) FILTER (
      WHERE stage_order >= :booked_stage_order
         OR has_linked_booking = true
    ) AS leads_booked
  FROM lead_cohort
  GROUP BY day
)

SELECT
  day,
  leads_created,
  leads_booked,
  leads_booked::decimal / NULLIF(leads_created, 0) AS lead_to_booked_rate
FROM daily_counts
ORDER BY day;
```

### Notes

```text
Do not calculate this as bookings this week ÷ leads this week.
This must be cohort-based.
Recent days may change as leads book later.
```

---

# 4. Recommended Normalized Tables

## appointments

```text
id
client_id
source_connection_id

external_id
contact_external_id
calendar_external_id
location_external_id

booked_at
appointment_start_at
appointment_end_at

status_raw
normalized_status

attended_marked_at
no_show_marked_at
status_updated_at

source
campaign
channel
service_line
location

raw_payload
synced_at
created_at
updated_at
```

## crm_opportunities

```text
id
client_id
source_connection_id

external_id
contact_external_id

pipeline_external_id
stage_external_id
stage_order

status
monetary_value
source
channel
campaign
service_line
location

opportunity_created_at
opportunity_updated_at
stage_changed_at
status_changed_at

raw_payload
synced_at
created_at
updated_at
```

## marketing_cost_items

```text
id
client_id
source_connection_id nullable

cost_date
period_start nullable
period_end nullable

cost_type
# ad_spend | roman_retainer | brooke_labor | software | other

source
# meta_ads | google_ads | manual_sheet | retainer_schedule | software_schedule

campaign_id nullable
service_line nullable
location nullable
channel nullable

amount
currency

hours nullable
hourly_rate nullable

allocation_method
# actual_daily | daily_prorated | manual | imported

included_in_marketing_investment boolean

confidence
raw_payload nullable
created_at
updated_at
```

## recurring_cost_schedules

```text
id
client_id

name
cost_type
amount
currency

billing_period
# monthly | weekly | annual

allocation_method
# daily_prorated

start_date
end_date nullable

included_in_marketing_investment
created_at
updated_at
```

## metric_values

```text
id
client_id
period_id

metric_key
value
value_low nullable
value_high nullable
unit

prior_value nullable
delta_absolute nullable
delta_percent nullable

status
# green | yellow | red | grey

confidence
# high | medium | low | unavailable

source_name
last_updated_at
calculation_note

created_at
updated_at
```

---

# 5. API Response Rules

Every metric endpoint should return:

```json
{
  "metric": "metric_key",
  "period": {
    "start": "2026-05-01",
    "end": "2026-05-07",
    "timezone": "Europe/Madrid"
  },
  "definition": "...",
  "formula": "...",
  "date_field": "...",
  "series": [],
  "total": {},
  "source": "...",
  "confidence": "high | medium | low | unavailable",
  "last_synced_at": "...",
  "notes": []
}
```

---

# 6. Implementation Checklist

A metric is implemented when:

```text
source fields mapped
date field confirmed
formula implemented
status filters implemented
timezone applied
daily zero-fill works
division-by-zero handled
confidence returned
data freshness returned
API response includes definition
frontend chart uses backend series
edge cases documented
```

---

# 7. Critical Rules

```text
1. Booked chart uses booked_at/dateAdded.
2. Attended chart uses appointment_start_at/startTime.
3. Show Rate uses appointment_start_at for numerator and denominator.
4. Opportunities chart uses opportunity_created_at.
5. Lead → Booked % is cohort-based by lead_created_at.
6. Projected Revenue is an estimate, not actual attributed revenue.
7. Total Marketing Investment uses cost allocation, not invoice date.
8. Cost Per Booking is not Cost Per New Patient.
9. LTV:CAC should not use raw daily bars.
10. Every daily chart must zero-fill missing dates.
11. Every metric must expose source, formula, date field, confidence, and freshness.
```
