# E-Commerce Listing Management — OpenClaw Reference Guide

## What This Does

This guide configures OpenClaw as a product listing management assistant for e-commerce sellers who operate across multiple platforms (Etsy, eBay, Amazon, Shopify storefronts). The agent monitors listings for pricing changes, competitor activity, and inventory levels, then drafts or updates product descriptions, titles, and tags based on current market data. It also handles routine tasks like responding to buyer inquiries, flagging low-stock items, and generating weekly sales performance summaries.

## Who This Is For

**User profile:** Small-to-medium e-commerce sellers managing 50-5,000 SKUs across one or more online marketplaces.

**Industry:** Retail e-commerce — handmade goods, dropshipping, private-label consumer products, vintage/resale.

**Pain point:** Listing management across platforms is repetitive and time-consuming. Sellers spend 3-5 hours per day updating titles, descriptions, pricing, and responding to buyer messages. SEO-optimized listing copy requires research that most solo sellers skip. Inventory sync errors between platforms cause overselling and negative reviews.

**Technical comfort:** Moderate. These users can follow step-by-step instructions and are comfortable with web dashboards, but most are not developers. They need the agent to work through browser automation and email rather than APIs.

---

## OpenClaw Setup

### Required Skills

Install these skills in order. Always run `skill-vetter` first.

```bash
# Security foundation (install these before anything else)
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core functionality
clawhub install gog                    # Gmail for buyer message monitoring + Google Sheets for inventory tracking
clawhub install agent-browser          # Browser automation for marketplace dashboards
clawhub install tavily-web-search      # Competitor research and market pricing
clawhub install summarize              # Summarize competitor listings, reviews, market reports

# Business operations
clawhub install bookkeeper             # Invoice intake and payment verification
clawhub install financial-overview     # Sales performance dashboard
clawhub install csv-toolkit            # Bulk listing data manipulation

# Communication
clawhub install whatsapp-cli           # Supplier communication (if applicable)
clawhub install agent-mail             # Dedicated inbox for marketplace notifications

# Productivity
clawhub install automation-workflows   # Multi-step listing update workflows
clawhub install self-improving-agent   # Learn seller preferences over time
```

### Optional Skills

```bash
clawhub install image-generation       # Generate product mockup images from descriptions
clawhub install canva                  # Create branded listing images and banners
clawhub install ga4-analysis           # Website traffic analysis for Shopify storefronts
clawhub install notion                 # Product catalog knowledge base
clawhub install data-analyst           # Sales trend analysis and reporting
```

### Channel Configuration

Set up the following notification channels:

1. **Gmail (via `gog`):** Connect the seller's primary marketplace email. The agent monitors this for buyer messages, order notifications, and marketplace policy updates.

2. **WhatsApp (via `whatsapp-cli`):** Optional channel for supplier reorder alerts. Configure with your primary supplier contacts.

3. **Google Sheets (via `gog`):** Create a master inventory sheet the agent can read and update. Columns: SKU, Platform, Title, Price, Stock Level, Last Updated, Status.

### Hardware Recommendations

- **Minimum:** Any Mac with 8GB RAM running macOS 14+. The `agent-browser` skill needs Chrome or Playwright installed locally.
- **Recommended:** Mac Mini M2 or later with 16GB RAM, always-on with ethernet connection. E-commerce listing management benefits from 24/7 uptime since marketplace algorithms favor sellers who respond quickly to buyer inquiries.
- **Storage:** 50GB free minimum. Product images and listing data accumulate quickly.

---

## Core Automation Recipes

### 1. Morning Listing Health Check

Scan all active listings for issues — expired listings, suppressed items, pricing errors, and low-stock warnings.

```bash
openclaw cron add --every day --at 07:00 "Check all marketplace dashboards via agent-browser. For each platform (Etsy, eBay, Amazon), log in and scan for: suppressed or expired listings, pricing alerts, items with stock below 5 units, and any policy violation notices. Compile a summary and email it to me via gog. Flag anything urgent with [ACTION REQUIRED] in the subject line."
```

### 2. Competitor Price Monitoring

Track competitor pricing for your top 20 SKUs and alert when significant changes occur.

```bash
openclaw cron add --every 4h "Use tavily-web-search to check current market prices for the products listed in my 'Competitor Watch' Google Sheet (via gog). Compare against my current prices. If any competitor has dropped price by more than 10%, send me a summary with the product name, my price, their price, and the percentage difference. Do not change my prices automatically."
```

### 3. Buyer Message Response Drafting

Monitor marketplace inboxes and draft responses to common buyer questions.

```bash
openclaw cron add --every 30m "Check my marketplace email inbox via gog for new buyer messages. For each message: (1) Identify the product being asked about, (2) Check inventory status in the master Google Sheet, (3) Draft a friendly, professional response addressing their question. Save drafts in Gmail — do NOT send automatically. Mark the draft with [DRAFT - REVIEW] in the subject."
```

### 4. Weekly Sales Performance Report

Generate a comprehensive sales summary every Monday morning.

```bash
openclaw cron add --every week --on monday --at 08:00 "Pull sales data from the last 7 days across all platforms using agent-browser. Use data-analyst to calculate: total revenue, units sold, top 5 best sellers, top 5 worst performers, average order value, and return rate. Compare against the previous week. Format as a clean summary and email via gog with subject 'Weekly Sales Report - [date range]'."
```

### 5. Listing SEO Optimization Queue

Identify underperforming listings and suggest title/description improvements.

```bash
openclaw cron add --every day --at 14:00 "From my master inventory sheet (via gog), identify the 5 listings with the lowest views-to-sales conversion this week. For each one, use tavily-web-search to research current top-ranking keywords for that product category. Draft an improved title and first paragraph of the description optimized for marketplace search. Save suggestions in a 'Listing Improvements' tab in the master Google Sheet."
```

### 6. Low Stock Reorder Alert

Monitor inventory levels and trigger supplier reorder notifications.

```bash
openclaw cron add --every 2h "Check the master inventory Google Sheet (via gog) for any SKU where current stock is at or below the reorder point column. For items that need reordering: (1) Calculate the suggested reorder quantity based on the 30-day sales velocity, (2) Draft a reorder message to the supplier listed for that SKU, (3) Send me the reorder request via whatsapp-cli for approval before forwarding to the supplier."
```

### 7. Review Monitoring and Response

Track new product reviews and draft appropriate responses.

```bash
openclaw cron add --every 6h "Use agent-browser to check for new product reviews across all marketplace accounts. For negative reviews (3 stars or below): summarize the complaint, check if the order had any known issues, and draft a professional, empathetic response. For positive reviews (4-5 stars): draft a brief thank-you response. Save all drafts for my review — do not post automatically."
```

### 8. Bulk Listing Update from Spreadsheet

Process bulk listing changes from a prepared spreadsheet.

```bash
openclaw cron add --every day --at 22:00 "Check the 'Pending Updates' tab in the master Google Sheet (via gog). For each row marked 'Ready': use agent-browser to navigate to the listing on the specified platform and update the fields indicated (price, title, description, or tags). After each update, mark the row as 'Completed' with a timestamp. If any update fails, mark it as 'Failed' with the error reason."
```

---

## Guardrails and Safety

### The Agent Must NEVER

1. **Change product prices autonomously.** The agent can research and recommend price changes, but a human must approve and execute price modifications. Incorrect pricing on marketplaces can result in losses or account suspension.

2. **Send messages to buyers without human review.** All buyer communications must be drafted and held for review. Marketplace accounts can be suspended for inappropriate or inaccurate buyer communications.

3. **Accept returns, issue refunds, or modify orders.** These are financial transactions that require human authorization. The agent can draft the response, but the seller must execute it.

4. **Create or publish new listings without review.** The agent can draft listings and stage them, but publishing requires human sign-off. Marketplace listing policies vary and violations can result in account-level penalties.

5. **Access or store payment credentials.** The agent should never handle credit card numbers, bank account details, or marketplace payout information.

6. **Modify account settings or billing information.** Changes to seller account settings, shipping profiles, or payment methods must be done manually by the seller.

7. **Place supplier orders autonomously.** Reorder recommendations require explicit human approval before any purchase order is sent. Use `agentguard` to enforce this boundary.

### Recommended `agentguard` Configuration

```
Block: Any action containing "submit order", "place order", "confirm purchase"
Block: Any action containing "send message" or "post reply" on marketplace domains
Block: Any action containing "change price" or "update price" on marketplace domains
Allow: Read-only browsing of marketplace dashboards
Allow: Drafting messages in Gmail
Allow: Updating Google Sheets
```

---

## Sample Prompts

### Prompt 1: Initial Setup and Inventory Import

```
I sell handmade candles on Etsy and eBay. I have about 200 active listings. Here is my current inventory spreadsheet as a CSV. Please:
1. Import this into a Google Sheet called "Master Inventory - [my store name]"
2. Add columns for: Reorder Point, Supplier, Last Price Check Date, 30-Day Sales Velocity
3. Set up the sheet so you can read and update it going forward
4. Give me a summary of my current inventory health — how many items are low stock, how many have no sales in 30 days, and my total estimated inventory value
```

### Prompt 2: Competitive Analysis for a Product Line

```
I want to improve my pricing strategy for my soy candle line. Use tavily-web-search to research the top 20 soy candle sellers on Etsy. For each, note their price range, shipping strategy (free vs paid), and any common keywords in their titles I am not using. Compile this into a Google Sheet tab called "Competitor Analysis - Soy Candles" and give me a summary of where I am positioned relative to the market.
```

### Prompt 3: Listing Optimization Batch

```
Here are my 10 worst-performing listings by conversion rate this month. For each one:
1. Research what top sellers in the same category are doing differently with their titles and tags
2. Draft an improved title (under 140 characters) optimized for marketplace search
3. Draft an improved first paragraph of the description that leads with the key benefit
4. Suggest 5 new tags I should add
Put all suggestions in the "Listing Improvements" tab of my master sheet. Do not update any live listings yet.
```

### Prompt 4: Holiday Season Preparation

```
The holiday shopping season starts in 6 weeks. Help me prepare:
1. Identify my top 20 sellers from last year's Q4 (check my sales history via agent-browser)
2. Check current stock levels for those items against projected demand
3. Draft reorder quantities for anything that will likely sell out before December 25
4. Research trending holiday gift keywords in my product categories using tavily-web-search
5. Create a "Holiday Prep Checklist" tab in my master sheet with all action items and deadlines
```

### Prompt 5: Daily Operations Handoff

```
Give me today's e-commerce briefing:
- New orders since yesterday
- Buyer messages waiting for response (draft replies for the routine ones)
- Any listings with issues (expired, suppressed, out of stock)
- Items that shipped yesterday — confirm tracking was uploaded
- Today's priority actions ranked by urgency
```

---

## Common Gotchas

### 1. Marketplace Session Timeouts Break Automation

**Problem:** Marketplace websites (especially Etsy and eBay) aggressively expire login sessions. The `agent-browser` skill will fail silently when the session expires, and the agent may report "no issues found" when it actually could not access the dashboard.

**Fix:** Set up a cron job that explicitly checks login status before running any dashboard scan. Include a step like "First, verify you are logged into [platform] by checking for the account name in the top navigation. If you are logged out, notify me immediately instead of proceeding." Store marketplace credentials in environment variables, not in prompts. Consider using marketplace APIs where available instead of browser automation for critical tasks.

### 2. Google Sheets Rate Limits on High-Volume Updates

**Problem:** When running bulk operations (updating hundreds of rows in the master inventory sheet), the `gog` skill can hit Google Sheets API rate limits. This causes partial updates where some rows are modified and others are silently skipped, leaving the inventory sheet in an inconsistent state.

**Fix:** For bulk updates, batch changes into groups of 20-30 rows with brief pauses between batches. Always include a verification step at the end: "After all updates, count the rows marked 'Completed' and compare against the total 'Ready' rows to confirm all updates were processed." For very large updates (500+ rows), use `csv-toolkit` to prepare the data locally and upload as a single sheet replacement rather than row-by-row updates.

### 3. Marketplace Policy Changes Invalidate Listing Templates

**Problem:** Marketplaces frequently update their listing requirements — character limits for titles, required disclosure fields, restricted keywords, and image specifications. Listing templates that worked last month may trigger policy violations today. The agent will not automatically know about policy changes unless instructed to check.

**Fix:** Add a weekly cron job specifically for policy monitoring: `openclaw cron add --every week --on sunday --at 20:00 "Use tavily-web-search to check for any recent policy updates from Etsy, eBay, and Amazon seller forums. Summarize any changes that affect listing requirements, prohibited items, or fee structures. Email the summary to me via gog."` Update your listing templates and agent instructions whenever policy changes are detected.

---

## Maintenance Schedule

| Frequency | Task | Method |
|-----------|------|--------|
| Daily | Review drafted buyer responses | Manual review of Gmail drafts |
| Daily | Check morning health report | Read email summary from agent |
| Weekly | Review sales performance report | Read Monday morning email |
| Weekly | Approve/reject listing optimization suggestions | Review Google Sheet tab |
| Monthly | Audit agent's listing accuracy | Spot-check 10 random listings against live marketplace data |
| Monthly | Run `skills-audit` | `skills-audit` to check for permission drift |
| Quarterly | Review `agentguard` rules | Ensure guardrails match current business operations |
| Quarterly | Update competitor watch list | Add/remove competitors in tracking sheet |

---

## Cost Considerations

- **API costs:** The `tavily-web-search` skill uses paid API credits. Competitor monitoring every 4 hours across 20 SKUs will consume roughly 150-200 searches per day. Monitor with `model-usage`.
- **Token usage:** Listing description generation and buyer message drafting are token-intensive. Budget approximately $5-15/day in API costs for a 200-SKU operation with active buyer communication.
- **Browser automation:** The `agent-browser` skill runs Chrome locally. On a Mac Mini, expect 2-4GB of RAM consumed during marketplace dashboard scans. Close other browser instances during scheduled scan windows.

---

## Scaling Considerations

### Single Platform to Multi-Platform

If you start with a single marketplace (e.g., Etsy only), the setup is simpler: you only need one set of dashboard credentials and one listing format. When expanding to additional platforms, keep these things in mind:

- **Separate Google Sheet tabs per platform.** Do not combine Etsy, eBay, and Amazon listings in a single tab. Platform-specific fields (Etsy tags vs Amazon bullet points vs eBay item specifics) make a unified schema unwieldy.
- **Stagger cron jobs by platform.** If you run health checks across three platforms simultaneously, the `agent-browser` skill will struggle with multiple concurrent browser sessions. Schedule them 15 minutes apart.
- **Platform-specific listing templates.** What converts on Etsy (storytelling, handmade emphasis) performs poorly on Amazon (feature bullets, keyword density). Maintain separate writing style instructions per platform in the agent's `self-improving-agent` memory.

### Scaling Beyond 500 SKUs

At 500+ active SKUs, Google Sheets starts to slow down noticeably, especially with frequent read/write operations. Consider:

- **Splitting the master sheet** into category-specific sheets (Color Products, Skincare, Tools, etc.) and linking them through a summary dashboard sheet.
- **Using `duckdb` for analysis.** Export inventory data to CSV periodically and run analytical queries through `duckdb` rather than filtering large Google Sheets in real time.
- **Reducing cron frequency.** At high SKU counts, running competitor price checks every 4 hours across all products becomes expensive. Switch to a tiered approach: check your top 20 products every 4 hours, the next 50 every 12 hours, and everything else weekly.

### Multi-User Access

If you have a team (virtual assistants, warehouse staff, partners), consider installing `agent-access-control` to create tiered permissions:

- **Owner tier:** Full access to all reports, pricing decisions, and guardrail overrides.
- **Assistant tier:** Can submit inventory updates and view reports, but cannot approve orders or modify prices.
- **Read-only tier:** Can query inventory levels and view reports, but cannot make any changes.

---

## Related Guides

- `finance_expense_tracking.md` — For tracking marketplace fees and shipping costs
- `freelance_invoice_tracking.md` — For sellers who also do wholesale or custom orders
- `personal_email_triage.md` — For separating business email from personal inbox
