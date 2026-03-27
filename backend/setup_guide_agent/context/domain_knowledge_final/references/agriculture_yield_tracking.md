# Agriculture Yield Tracking — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a farm management assistant that tracks crop yields across fields and seasons, monitors weather conditions that affect planting and harvest decisions, logs field observations, and generates production reports. It replaces the paper notebooks, scattered spreadsheets, and memory-based record-keeping that most small-to-mid-size farm operations rely on with a structured system the farmer can interact with by voice or text from the field.

The agent collects yield data at harvest, compares it against historical performance, correlates results with weather patterns and input costs, and surfaces actionable insights about which fields, varieties, and practices are producing the best returns.

## Who This Is For

**Primary user:** Small-to-mid-size farm operators (50-5,000 acres), family farmers, market gardeners, and agricultural consultants who advise multiple farm clients.

**Industry:** Row crop agriculture (corn, soybeans, wheat, cotton), specialty crops (vegetables, fruit, nuts), and mixed-use farms. Also applicable to ranch operations tracking forage yields and grazing rotations.

**Pain point:** Most farmers know their overall production numbers but lack granular field-by-field, variety-by-variety data that would reveal which practices are working and which are costing money. The data exists in combine monitors, handwritten notes, and receipts, but nobody has time to compile it into a usable decision-making tool during the busy season. By the time winter arrives and there is time to analyze, the details are fuzzy.

**Technical comfort:** Low to moderate. Many farmers are comfortable with smartphones and basic apps but do not have IT support. This guide assumes the user can install OpenClaw on a Mac Mini or laptop and paste commands. Voice input via phone is an important interaction mode for in-field use.

## OpenClaw Setup

### Skills to Install

```bash
# Security baseline
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core functionality
clawhub install gog                    # Gmail + Calendar + Sheets + Drive
clawhub install weather                # Real-time weather and forecasts
clawhub install obsidian               # Field notes and observation log
clawhub install todoist                # Task tracking for field operations
clawhub install openai-whisper         # Voice-to-text for field notes
clawhub install summarize              # Summarize reports and articles
clawhub install tavily-web-search      # Market prices, ag news, pest alerts

# Data analysis
clawhub install data-analyst           # Yield analysis and reporting
clawhub install csv-toolkit            # Process yield monitor CSV exports
clawhub install duckdb                 # SQL queries on large yield datasets

# Optional enhancements
clawhub install brave-search           # Research pest management, soil health
clawhub install self-improving-agent   # Learn farm-specific patterns over time
clawhub install automation-workflows   # Multi-step data processing pipelines
clawhub install agent-mail             # Triage supplier and buyer emails
```

### Channels to Configure

- **Voice input (`openai-whisper`):** The primary input method during fieldwork. The farmer records a voice memo while walking a field, and Whisper transcribes it into a structured observation note. This is how most day-to-day data entry happens — nobody types detailed notes while standing in a soybean field.

- **Google Sheets (`gog`):** The yield tracking master spreadsheet with columns for: field name, acreage, crop, variety, planting date, harvest date, yield (bu/acre or lbs/acre), moisture at harvest, inputs applied (fertilizer, seed, chemicals), input cost per acre, and notes. A second sheet tracks weather events by date.

- **Calendar (`gog`):** Planting windows, spray application dates, crop scouting schedules, equipment maintenance, and harvest timing all go on the calendar.

- **Obsidian vault:** Structured field notes organized by field name and date. Each note captures observations like crop condition, pest pressure, weed pressure, soil moisture, and equipment issues. The vault becomes a multi-year knowledge base.

- **Email (`gog` + `agent-mail`):** Monitors for seed dealer confirmations, fertilizer delivery schedules, grain elevator pricing updates, crop insurance communications, and USDA program deadlines.

### Hardware Recommendations

- **Mac Mini or Linux box at the farmhouse.** OpenClaw runs continuously to process voice notes uploaded from the field, monitor weather, and maintain the data systems. A Mac Mini is ideal — low power consumption, reliable, and sits quietly on a desk.

- **Smartphone with voice recording app.** The farmer records voice memos in the field and they sync (via iCloud, Dropbox, or Google Drive) to the machine running OpenClaw.

- **Optional: weather station with API.** If the farm has a Davis Vantage Pro or similar connected weather station, the agent can pull hyperlocal weather data rather than relying on the nearest NWS station.

### API Keys Required

| Service | Key | Where to Get It |
|---|---|---|
| Google (OAuth) | Google Account login | accounts.google.com |
| Tavily | `TAVILY_API_KEY` | tavily.com |
| Todoist | `TODOIST_API_TOKEN` | todoist.com |
| OpenAI (for Whisper) | `OPENAI_API_KEY` or local | openai.com (or run locally) |

## Core Automation Recipes

### 1. Morning Farm Briefing

```bash
openclaw cron add --every day --at 05:30 "Give me this morning's farm briefing. Include: current weather conditions and today's forecast for our location, any weather alerts or frost warnings for the next 72 hours, any tasks due today from Todoist, any new emails from seed dealers or the grain elevator, and current commodity prices for corn, soybeans, and wheat from a quick web search. Keep it concise — I am reading this at 5:30am before heading out."
```

Farmers start early. A concise briefing sets the day's priorities before the first cup of coffee is finished.

### 2. Voice Note Processing

```bash
openclaw cron add --every 30m "Check the Google Drive 'Field Notes' folder for any new audio files. For each one, transcribe it using Whisper and extract: field name, crop observed, growth stage, pest or disease observations, weed pressure rating (1-5), estimated stand count or condition, soil moisture impression, and any action items. Save the structured note to Obsidian under 'Fields/[Field Name]/[Date]' and create Todoist tasks for any action items mentioned."
```

This is the backbone of the system — converting verbal field observations into structured, searchable data.

### 3. Harvest Yield Logging

```bash
openclaw cron add --every 4h "During harvest season (September through November), check the Google Drive 'Yield Data' folder for any new CSV exports from the combine yield monitor. For each file, process it using csv-toolkit to extract average yield per field, identify any low-yield zones, and append the data to the Yield Tracking Google Sheet. Calculate yield per acre and compare to the 3-year average for that field. Alert me if any field is more than 15% below its historical average."
```

Turns raw combine data into immediate, actionable yield intelligence.

### 4. Weather Event Logging

```bash
openclaw cron add --every 6h "Log the current temperature, precipitation, humidity, and wind speed to the Weather Log Google Sheet for our farm location. If any significant weather event occurs (more than 0.5 inches of rain, temperatures below 32F or above 100F, sustained winds above 30mph, or hail), create an alert entry with the date, event type, and severity. Cross-reference with any fields that are at a vulnerable growth stage."
```

Building a multi-year weather record correlated with yield data is the foundation of precision agriculture.

### 5. Crop Scouting Schedule

```bash
openclaw cron add --every monday --at 06:00 "Generate this week's crop scouting schedule. Based on planting dates in the Yield Tracking sheet, determine which fields need scouting this week (prioritize fields entering V6-V8 corn stage or R1-R3 soybean stage). Create a scouting route that minimizes driving time between fields. Add the schedule to Google Calendar and post a summary to my Todoist."
```

Systematic scouting catches problems before they become yield-limiting.

### 6. Input Cost Tracking

```bash
openclaw cron add --every day --at 12:00 "Check Gmail for any new invoices or receipts from seed companies, fertilizer dealers, chemical suppliers, or equipment dealers. Extract the vendor, product, quantity, total cost, and which field or operation it applies to. Update the Input Costs sheet in Google Sheets. Calculate the running cost-per-acre for each field and flag any field where input costs exceed our target of $X per acre."
```

Real-time input cost tracking prevents budget surprises at year-end.

### 7. Market Price Monitoring

```bash
openclaw cron add --every day --at 07:00 "Search for current cash prices and futures prices for corn, soybeans, and wheat at our nearest grain elevators and on the CME. Compare today's prices to our breakeven cost per bushel (stored in the Budget sheet). If any crop's current price exceeds our breakeven by more than 20%, alert me — this may be a good time to forward-contract. Include the basis level at our local elevator."
```

Selling grain at the right time can be the difference between a profitable and unprofitable year.

### 8. End-of-Season Analysis Report

```bash
openclaw cron add --every december 1 --at 09:00 "Generate a comprehensive end-of-season yield report. For each field, show: crop planted, variety, planting date, harvest date, yield per acre, comparison to 3-year average, total input costs, revenue at average selling price, and net return per acre. Rank fields from most profitable to least. Identify the top 3 factors that correlated with higher yields this year (variety choice, planting date, soil type, weather events). Save the report to Obsidian and create a Google Doc for sharing with my crop consultant."
```

The annual analysis that drives next year's planting decisions.

## Guardrails and Safety

### The Agent Must NEVER:

- **Execute grain sales or forward contracts.** The agent can alert you to favorable pricing and draft the details, but any commitment to sell grain must be a human action. A mistimed sale or accidental contract can cost thousands of dollars. Configure `agentguard` to block any action resembling a financial transaction.

- **Apply or recommend specific pesticide rates.** Pesticide application rates are regulated by law and must follow the product label. The agent can log what was applied but must never generate application recommendations. That is the job of a certified crop consultant or extension agronomist.

- **Share yield data externally.** Yield data is competitively sensitive information. The agent must never include field-level yield data in emails, messages, or documents shared outside the farm operation without explicit permission. Configure `agentguard` to block sharing of spreadsheet data.

- **Make equipment control decisions.** The agent tracks and reports but never controls irrigation systems, variable-rate application equipment, or any physical farm machinery. Those systems have their own safety controls.

- **Override planting or harvest timing decisions.** The agent provides data and forecasts, but the farmer makes the call. Agricultural decisions involve judgment factors (soil feel, equipment readiness, labor availability) that the agent cannot assess.

- **Access financial accounts or loan information.** Farm financial data beyond what is tracked in the yield and cost spreadsheets stays outside the agent's scope.

### Recommended `agentguard` Rules

```
Block: make_payment, send_external_data, execute_trade, delete_file
Allow: create_note, update_spreadsheet, create_task, search_web, read_email, transcribe_audio
Require approval: any email sent to grain elevator or buyer, any data export or sharing action
```

## Sample Prompts

### Prompt 1: Initial Farm Setup

```
I run a 1,200-acre corn and soybean rotation in central Illinois. My fields are: North 80 (80 acres, Drummer silty clay loam), South Quarter (160 acres, Flanagan silt loam), River Bottom (200 acres, Sawmill silty clay loam), Home Place (120 acres, Catlin silt loam), and Rented Ground (640 acres across 4 parcels). I plant Pioneer and Dekalb varieties. Set up my yield tracking system with field-by-field data, weather logging, voice note processing for field scouting, and market price alerts. My breakeven is $4.50/bu for corn and $11.00/bu for soybeans.
```

### Prompt 2: Mid-Season Scouting Report

```
I just finished scouting the North 80 and South Quarter this morning. Here are my voice notes from the field [attaches audio]. Process these notes and update my field records. For any pest or disease observations, search for the latest university extension recommendations for management in central Illinois corn. Add any follow-up actions to my Todoist.
```

### Prompt 3: Harvest Progress Check

```
We have been combining for 3 days now. I uploaded the yield monitor CSVs to the Yield Data folder. Process all new files and give me a harvest progress report: which fields are done, current average yields versus last year, any fields with surprisingly low yields that need investigation, and how much grain is in the bin versus contracted. Also check the weather forecast — do I need to worry about rain this week?
```

### Prompt 4: Year-End Landlord Report

```
I need to prepare a report for my landlord on the Rented Ground parcels. Generate a summary showing: yield per acre for each parcel, inputs applied and costs, revenue at the average selling price this season, and how yields compared to the county average. Format it professionally — this is a business document that affects whether I keep the lease.
```

## Common Gotchas

### 1. Yield Monitor CSV Formats Vary by Manufacturer

John Deere, Case IH, and AGCO yield monitors export data in different CSV formats with different column names and units. The first time you upload data from your monitor, the agent may misinterpret columns. **Fix:** Upload a small sample file first and verify the agent correctly identifies yield, moisture, GPS coordinates, and field boundaries. Create a format specification note in Obsidian that the agent can reference for future imports. The `csv-toolkit` skill handles format detection, but farm-specific column mappings may need manual correction once.

### 2. Voice Notes Need Consistent Field Naming

If you say "the north field" in one note and "North 80" in another, the agent may create duplicate field entries. **Fix:** Establish a strict naming convention for every field before starting and include it in your setup prompt. Stick to those names in every voice note. The `self-improving-agent` skill can learn aliases over time, but consistency from the start prevents early confusion.

### 3. Weather Data Granularity

The `weather` skill pulls forecasts from the nearest NWS station, which may be 10-30 miles from your fields. Microclimates, elevation differences, and proximity to rivers can make those forecasts inaccurate for your specific location. **Fix:** If precision matters (frost advisories, planting decisions), invest in a connected on-farm weather station and configure the agent to pull from that data source as well. Note discrepancies between the NWS forecast and on-farm observations in your field notes so the agent learns your local patterns over time.

### 4. Commodity Price Sources Can Be Stale

Free web search for commodity prices sometimes returns yesterday's close rather than the current market. Cash prices at local elevators are especially hard to get in real time. **Fix:** For critical pricing decisions, always verify the agent's price data against your elevator's posted bids (usually available on their website or by phone). Use the agent's price alerts as a trigger to check, not as the final number.

### 5. Seasonal Workflow Shifts

Farm operations have dramatically different workflows across seasons. During planting and harvest, the agent should prioritize weather alerts, yield data processing, and equipment scheduling. During winter, the priority shifts to year-end analysis, seed ordering, and crop insurance decisions. **Fix:** Create seasonal configuration prompts that you paste at the beginning of each season to shift the agent's focus and automation schedules.

---

## Annual Farm Data Calendar

```
January:    Year-end analysis | Seed orders | Crop insurance decisions
February:   Soil test results | Input budgeting | Pre-buy fertilizer
March:      Equipment prep | Planting plan finalization | Input delivery
April-May:  PLANTING — weather monitoring, planting date logging, stand counts
June-July:  GROWING — scouting, pest monitoring, irrigation (if applicable)
August:     Pre-harvest prep | Storage readiness | Market pricing review
Sept-Nov:   HARVEST — yield logging, moisture tracking, market decisions
December:   Year-end report | Landlord reports | Tax prep data export
```

## Skill Dependency Map

```
openai-whisper ────────────────┬──→ Field voice notes → structured text
                                │
gog (Gmail + Calendar + Sheets)┼──→ Email triage + calendar + yield data + budget
                                │
weather ────────────────────────┼──→ Forecasts + frost alerts + weather logging
                                │
obsidian ───────────────────────┼──→ Field notes archive + knowledge base
                                │
todoist ────────────────────────┼──→ Field operation tasks + scouting schedules
                                │
csv-toolkit ────────────────────┼──→ Yield monitor CSV processing
                                │
duckdb ─────────────────────────┼──→ SQL analysis on large yield datasets
                                │
data-analyst ───────────────────┼──→ Yield reports + trend analysis + charts
                                │
tavily-web-search ──────────────┼──→ Market prices + ag news + pest alerts
                                │
agent-mail ─────────────────────┘──→ Supplier and buyer email triage
```

## Cost Estimate

| Item | Monthly Cost |
|---|---|
| OpenClaw (local) | Free |
| Tavily API (free tier) | Free |
| Google Workspace (personal) | Free |
| Todoist (free tier) | Free |
| Whisper (local on Mac) | Free |
| Whisper (via OpenAI API) | ~$2-5/mo for voice notes |
| AI model usage | ~$10-25/mo (higher during harvest) |
| **Total** | **~$10-30/month** |

During planting and harvest seasons, model usage increases due to frequent voice note processing and yield data analysis. The off-season is significantly cheaper.

---

## Field Scouting Protocol

Standardize your voice note observations so the agent can parse them consistently. Use this template when walking a field:

```
Field: [Name]
Date: [Today]
Crop: [Crop and variety]
Growth stage: [V4, R2, etc.]
Stand count: [Plants per 30-foot row, or impression: excellent/good/fair/poor]
Weed pressure: [1-5 scale, dominant species if notable]
Insect pressure: [1-5 scale, species observed]
Disease observations: [Symptoms, location in canopy, estimated percentage of plants affected]
Soil moisture: [Dry / Adequate / Wet / Saturated]
Tile drainage: [Running / Not running / N/A]
Equipment notes: [Any field access issues, waterways, compaction areas]
Action items: [Spray needed, replant consideration, drainage repair, etc.]
```

The agent converts free-form voice notes into this structured format. After the first few notes, the `self-improving-agent` skill learns your speaking style and becomes more accurate at extracting the right fields.

## Yield Data Analysis Queries

Once you have 2-3 years of data in the system, the agent can answer increasingly powerful questions using `duckdb`:

### Cross-Year Comparisons
```
Compare corn yields on the North 80 across the last 3 years. Break down by variety planted, planting date, and growing season rainfall. Which combination of variety and planting date consistently produces the highest yields?
```

### Variety Performance Ranking
```
Across all fields, rank every corn variety I have planted by average yield per acre, adjusting for soil type. Which varieties outperform regardless of field? Which are field-dependent?
```

### Input ROI Analysis
```
For each field, calculate the cost of inputs (seed, fertilizer, chemicals) per bushel of grain produced. Rank fields by input efficiency. Are there fields where I am spending more per bushel than the grain is worth?
```

### Weather Correlation
```
Correlate July rainfall totals with corn yields across all fields and years. Is there a rainfall threshold below which yields drop sharply? How does this interact with soil type — do my heavier soils hold up better in dry years?
```

### Planting Date Optimization
```
Analyze the relationship between planting date and yield for soybeans across all fields and years. What is the optimal planting window for my area? How much yield do I lose per day of delay after the optimal window closes?
```

These analyses become more reliable with each additional year of data. The first year is baseline establishment; by year three, the patterns are actionable.

## Crop Insurance Integration

The agent can help with crop insurance documentation:

- **Track Actual Production History (APH).** The yield data in your Google Sheets is exactly what your crop insurance agent needs. At the end of each season, ask the agent to generate an APH-formatted report by county, crop, and practice (irrigated vs. non-irrigated).

- **Monitor prevent-plant deadlines.** The agent tracks planting progress against final planting dates for your county. If wet conditions are preventing planting, it alerts you when the prevent-plant reporting window opens.

- **Document loss events.** If a hail storm, flood, or drought damages a crop, the agent timestamps the weather event, logs the field-level impact from your scouting notes, and generates a loss summary document you can share with your adjuster.

**Important:** The agent does not file insurance claims or communicate with your insurance agent. It prepares documentation and alerts you to deadlines. The farmer makes all insurance decisions.

## Integrating with Precision Agriculture Equipment

Many farmers already have precision ag data flowing through platforms like John Deere Operations Center, Climate FieldView, or Granular. The agent complements (not replaces) these platforms:

- **Yield monitor exports:** Most precision ag platforms can export field-level yield data as CSV. Configure a weekly or post-harvest export to your Google Drive, and the agent ingests it automatically.

- **Soil test results:** When you receive soil test PDFs from your lab, drop them in a Drive folder. The `pdf-toolkit` skill extracts the data, and the agent logs it to your field records. Over multiple years, this builds a soil health trend for each field.

- **As-applied maps:** If your sprayer or planter logs application data, export the summaries to CSV. The agent can cross-reference application rates with yield results to evaluate whether variable-rate prescriptions are paying off.

The agent is not a replacement for FieldView or the Operations Center — it is the analytical layer that sits on top and asks "what does all this data actually mean for my bottom line?"

## Grain Marketing Decision Support

The agent provides data for grain marketing decisions but never executes trades. Here is how to structure the marketing support:

### Breakeven Calculation
The agent maintains a breakeven spreadsheet:
```
Crop:           Corn
Expected yield: 210 bu/acre (based on APH and current conditions)
Input costs:    $485/acre (seed $120 + fertilizer $210 + chemicals $85 + crop insurance $40 + land rent $30)
Breakeven:      $485 / 210 = $2.31/bu production cost
Target margin:  20% → Target sell price: $2.77/bu
Current price:  $4.85/bu → Well above target ✓
```

### Price Alert Tiers
Configure the agent with multiple alert levels:
```
openclaw cron add --every day --at 07:00 "Check corn futures. Alert levels: SELL SIGNAL at $5.20/bu (25% above 3-year avg), WATCH at $4.80/bu (near seasonal high), CAUTION at $3.80/bu (approaching breakeven). For soybeans: SELL SIGNAL at $13.50/bu, WATCH at $12.00/bu, CAUTION at $10.50/bu."
```

### Basis Tracking
The difference between futures and local cash price (basis) matters as much as the futures price itself:
```
openclaw cron add --every monday --at 08:00 "Search for current corn and soybean basis at [Elevator 1], [Elevator 2], and [Elevator 3]. Log to the Basis Tracking sheet. Compare to the same week last year. If basis is stronger than the 3-year average for this week, flag it as a favorable selling opportunity."
```

## Multi-Farm and Landlord Reporting

If you farm multiple tracts with different landlords (common in the Midwest), the agent generates separate reports per landlord:

- **Crop-share landlords** receive yield data, input cost breakdowns, and their share of gross revenue.
- **Cash-rent landlords** receive yield summaries and a note confirming rent payments were made on schedule.
- **Investor landlords** receive a more detailed performance report including ROI calculations and multi-year trends.

Ask the agent to format these professionally — landlord reports that demonstrate transparent, data-driven management help you retain and acquire rental ground.

---

*Last updated: March 2026. Based on OpenClaw skill registry v115.*
