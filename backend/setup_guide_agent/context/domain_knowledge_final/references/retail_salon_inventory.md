# Retail Salon Inventory Management — OpenClaw Reference Guide

## What This Does

This guide configures OpenClaw as an inventory and supply management assistant for retail salons (hair salons, nail salons, barbershops, day spas, and beauty supply retailers). The agent tracks product inventory levels, monitors usage rates per stylist or station, automates reorder workflows with distributors, and provides cost analysis to optimize product spend. It also handles appointment-linked product tracking — knowing which services consume which products — so the salon owner can forecast supply needs based on their booking calendar.

## Who This Is For

**User profile:** Salon owners or managers responsible for keeping 100-800 product SKUs in stock across categories like hair color, developer, shampoo/conditioner backbar, retail products, disposables, and equipment.

**Industry:** Beauty and personal care retail — hair salons, barbershops, nail salons, esthetician studios, day spas, and multi-location salon groups.

**Pain point:** Salon inventory is uniquely challenging because products are consumed both internally (backbar usage during services) and sold retail. Most salon owners rely on mental tracking or handwritten lists, leading to emergency distributor runs, expired product waste, and inability to identify which product lines are actually profitable. Distributor ordering is fragmented across multiple suppliers with different minimum orders and delivery schedules.

**Technical comfort:** Low to moderate. Most salon owners are not technically inclined. They need a system that works through familiar channels — text messages, simple spreadsheets, and voice memos — rather than dashboards or terminals.

---

## OpenClaw Setup

### Required Skills

```bash
# Security foundation
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core functionality
clawhub install gog                    # Google Sheets for inventory tracking + Gmail for distributor communication
clawhub install agent-browser          # Browser-based ordering from distributor websites
clawhub install summarize              # Summarize distributor catalogs and promo emails
clawhub install whatsapp-cli           # Primary communication channel (many salon owners prefer WhatsApp)

# Business operations
clawhub install bookkeeper             # Track distributor invoices and payments
clawhub install financial-overview     # Product cost vs revenue analysis
clawhub install csv-toolkit            # Import/export inventory data from POS systems

# Productivity
clawhub install automation-workflows   # Multi-step reorder workflows
clawhub install apple-reminders        # Quick reminders for physical inventory counts
clawhub install self-improving-agent   # Learn salon-specific patterns over time
```

### Optional Skills

```bash
clawhub install data-analyst           # Usage trend analysis and forecasting
clawhub install pdf-toolkit            # Process distributor invoices and catalogs in PDF
clawhub install notion                 # Product knowledge base (color formulas, mix ratios)
clawhub install translate-image        # Read product labels in other languages
clawhub install image-generation       # Create product display signage
```

### Channel Configuration

1. **WhatsApp (via `whatsapp-cli`):** Primary channel for the salon owner. Set up for:
   - Quick stock checks ("how many tubes of Redken 7N do we have?")
   - Reorder approval ("approve" / "hold" responses to reorder requests)
   - Daily low-stock alerts
   - Staff inventory requests ("Station 3 needs more foils")

2. **Gmail (via `gog`):** Secondary channel for:
   - Distributor order confirmations
   - Promo and sale notifications from suppliers
   - Weekly inventory reports

3. **Google Sheets (via `gog`):** Master inventory database with sheets for:
   - Current Inventory (SKU, Brand, Product, Category, Quantity, Unit Cost, Retail Price, Reorder Point, Supplier)
   - Usage Log (Date, Product, Quantity Used, Service Type, Stylist)
   - Order History (Date, Supplier, Items, Total, Status)
   - Price Comparisons (Product, Supplier A Price, Supplier B Price, Best Price)

### Hardware Recommendations

- **Minimum:** Any Mac with 8GB RAM. The salon does not need 24/7 uptime — most inventory operations can run during business hours.
- **Recommended:** Mac Mini M2 with 8GB RAM, kept in the back office on Wi-Fi. A dedicated machine avoids the problem of the agent going offline when the owner takes their laptop home.
- **Practical note:** Salon environments are humid, dusty with hair clippings, and subject to chemical fumes. Keep the machine in a closed cabinet or back office, not on the salon floor.

---

## Core Automation Recipes

### 1. Daily Opening Stock Check

Review inventory levels and flag urgent shortages before the day's appointments begin.

```bash
openclaw cron add --every day --at 07:30 "Check the master inventory Google Sheet (via gog). Identify all products where current quantity is at or below the reorder point. Cross-reference against today's appointment schedule — if any booked services require products that are low or out of stock, flag those as URGENT. Send a summary via whatsapp-cli to the salon owner with two sections: URGENT (needed today) and LOW STOCK (need to reorder this week)."
```

### 2. Post-Service Inventory Deduction

Prompt stylists to log product usage after each service.

```bash
openclaw cron add --every 2h "Send a WhatsApp message via whatsapp-cli to the salon owner asking: 'Quick check-in — any products used in the last 2 hours to log? Reply with the product name and approximate amount (e.g., Redken 7N x2 tubes, 20vol developer 500ml).' When they reply, update the Usage Log and subtract from Current Inventory in the Google Sheet via gog."
```

### 3. Weekly Distributor Order Preparation

Compile a recommended order based on usage rates and current stock.

```bash
openclaw cron add --every week --on wednesday --at 10:00 "Analyze the last 14 days of usage from the Usage Log in Google Sheets (via gog). Calculate the average daily usage rate for each product. For any product where current stock will run out within 10 days based on this rate, add it to a recommended reorder list. Check the Price Comparisons sheet for the best supplier for each item. Group items by supplier to meet minimum order requirements. Send the draft order to the salon owner via whatsapp-cli for approval."
```

### 4. Distributor Promo Monitoring

Watch for sales and promotions from key distributors.

```bash
openclaw cron add --every day --at 09:00 "Check Gmail (via gog) for emails from salon distributors (SalonCentric, CosmoProf, Beauty Systems Group, or any addresses in the 'Distributors' contact group). Use summarize to extract any current promotions, sales, or clearance deals. If any promo applies to products we regularly order, calculate the savings vs our normal price and send a summary via whatsapp-cli: 'Promo alert: [product] is [X]% off at [distributor] until [date]. Normal cost: $X. Promo cost: $Y. Savings on a typical order: $Z.'"
```

### 5. Monthly Inventory Valuation Report

Generate a financial summary of inventory on hand.

```bash
openclaw cron add --every month --on 1 --at 08:00 "Pull the full Current Inventory sheet from Google Sheets (via gog). Calculate: total inventory value at cost, total inventory value at retail, estimated margin if all retail products sold, top 10 products by dollar value on shelf, products with zero movement in 60+ days (dead stock candidates), and total spend on inventory this month from the Order History sheet. Format as a clean report and email via gog with subject 'Monthly Inventory Report - [month/year]'."
```

### 6. Expiration Date Tracking

Monitor products approaching their expiration or best-by dates.

```bash
openclaw cron add --every week --on monday --at 08:00 "Check the 'Expiration Date' column in the Current Inventory Google Sheet (via gog). Flag any products expiring within the next 60 days. For items expiring within 30 days, recommend: (1) move to a prominent retail display with a discount, (2) increase backbar usage, or (3) donate/dispose. Send the list via whatsapp-cli with specific action recommendations for each expiring item."
```

### 7. Physical Count Reconciliation

Support periodic physical inventory counts with a guided workflow.

```bash
openclaw cron add --every month --on 15 --at 19:00 "It is physical count night. Send a WhatsApp message via whatsapp-cli to the salon owner: 'Time for the monthly physical count. I have prepared a count sheet in the Google Sheet tab called Count - [month]. Please go station by station and reply with actual counts. I will compare against the system and flag any discrepancies greater than 10%.' After receiving counts, update the Current Inventory sheet and log the variance in a 'Count Variance' tab."
```

### 8. New Product Setup Assistant

Help add new products to the inventory system when a new line is brought in.

```bash
openclaw cron add --every day --at 12:00 "Check Gmail (via gog) for any distributor order confirmations received in the last 24 hours. For any products in the order that are NOT already in the Current Inventory sheet, flag them as 'New Product - Setup Required.' Send a WhatsApp via whatsapp-cli asking the salon owner for each new product: retail price, reorder point, and which service category it belongs to. Once they reply, add the complete entry to the inventory sheet."
```

---

## Guardrails and Safety

### The Agent Must NEVER

1. **Place orders with distributors autonomously.** The agent prepares and recommends orders, but the salon owner must explicitly approve before any purchase is made. Use `agentguard` to block any browser action on distributor checkout pages.

2. **Share pricing or inventory data externally.** Salon product costs, margins, and supplier pricing are confidential business data. The agent must not include this information in any external communication.

3. **Modify retail prices without approval.** Even for expiring products, the agent can only recommend price changes. The salon owner sets all customer-facing prices.

4. **Contact distributors directly.** The agent drafts communications, but the salon owner sends them. Distributor relationships are personal in the salon industry and a bot interaction could damage them.

5. **Delete inventory records.** The agent can mark items as discontinued or zero-stock, but must never delete historical inventory data. Variance tracking and cost analysis depend on complete records.

6. **Access or store payment methods.** Distributor account credentials and payment information must never be stored in the agent's memory or Google Sheets. Use `agentgate` if distributor websites are accessed via `agent-browser`.

7. **Make assumptions about product substitutions.** Hair color products are NOT interchangeable. The agent must never suggest "use product X instead of product Y" for color or chemical products. Only the salon owner or a licensed professional can make substitution decisions.

### Recommended `agentguard` Configuration

```
Block: Any action containing "place order", "submit order", "checkout", "confirm purchase"
Block: Any action containing "change price", "set price", "discount" on POS or e-commerce systems
Block: Any action on distributor websites beyond read-only browsing
Allow: Reading and updating Google Sheets
Allow: Sending WhatsApp messages for alerts and requests
Allow: Reading Gmail for distributor emails
```

---

## Sample Prompts

### Prompt 1: Initial Inventory Setup

```
I own a hair salon with about 300 products. I have three main categories: backbar (shampoo, conditioner, treatments we use during services), color (tubes, developers, lighteners), and retail (products we sell to clients). I order from SalonCentric and CosmoProf mainly.

Here is a CSV export from my POS system with my current inventory. Please:
1. Import this into a Google Sheet called "Salon Inventory - [salon name]"
2. Add columns for: Reorder Point, Usage Rate (per week), Supplier, Category, Expiration Date
3. Flag any items that look like they might be duplicates
4. Give me a summary: how many products total, breakdown by category, and estimated total inventory value
```

### Prompt 2: Usage Pattern Analysis

```
I have been logging product usage in the Google Sheet for the past 30 days. Please analyze the Usage Log and tell me:
1. Which 10 products are we using the fastest?
2. Are there any products we are using much more or much less than expected based on our service volume?
3. Based on current usage rates, which products will we run out of in the next 2 weeks?
4. Are there any stylists whose product usage is significantly higher than others for the same services?
```

### Prompt 3: Supplier Consolidation

```
I currently order from 4 different distributors. I want to simplify. Can you:
1. List every product we ordered in the last 3 months, grouped by supplier
2. Check if any of the products we buy from one supplier are also available at a different supplier (use tavily-web-search to check distributor catalogs)
3. Calculate what our order would look like if we consolidated to just 2 suppliers
4. Show me the cost impact — would we save or lose money by consolidating?
```

### Prompt 4: Retail Product Performance Review

```
I need to evaluate which retail products are worth keeping on the shelf. From the inventory and sales data:
1. Which retail products have not sold a single unit in 90 days?
2. Which retail products have the highest margin (retail price vs cost)?
3. Which retail products have the fastest turnover?
4. Recommend which products to discontinue and which to feature more prominently
Put the analysis in a new tab called "Retail Product Review" in the inventory sheet.
```

### Prompt 5: Emergency Restock

```
I just realized we are almost out of 20-volume developer and we have a full day of color appointments tomorrow. Check our distributor options:
1. Does SalonCentric have same-day pickup available in my area?
2. What is the price difference between picking up locally vs our usual delivery order?
3. Draft a quick order for developer plus anything else that is at critical levels
Send the draft to me on WhatsApp so I can approve it before I call the order in.
```

---

## Common Gotchas

### 1. Unit of Measure Confusion Corrupts Inventory Counts

**Problem:** Salon products come in wildly different units — individual tubes, boxes of 12, liters, ounces, gallons. When stylists log usage as "2 colors" it is unclear whether that means 2 individual tubes or 2 boxes. The agent will faithfully subtract whatever number it receives, leading to inventory counts that drift dramatically from reality within weeks.

**Fix:** Establish a single unit of measure for each product during initial setup and document it clearly in the Google Sheet. Add a "Unit" column (e.g., "tube", "oz", "box of 12"). Include the unit in every WhatsApp prompt: "Reply with the product name and quantity in individual tubes (not boxes)." Run physical counts monthly to catch drift early. Configure `self-improving-agent` to learn each stylist's typical reporting patterns.

### 2. Distributor Websites Resist Browser Automation

**Problem:** Major salon distributors (SalonCentric, CosmoProf, Sally Beauty) have aggressive anti-bot measures on their websites. The `agent-browser` skill may get blocked, hit CAPTCHAs, or trigger account lockouts when attempting to browse catalogs or check prices. A locked distributor account is a serious problem for a salon.

**Fix:** Do NOT use `agent-browser` for distributor website login or ordering. Instead, use it only for public-facing pages (product catalogs, promo pages). For order management, have the agent draft orders in Google Sheets and the salon owner places them manually through the distributor's website or by phone. Use `tavily-web-search` for price checking from public catalog pages rather than logged-in sessions. Keep distributor account credentials completely out of the agent's reach.

### 3. WhatsApp Message Volume Can Overwhelm the Salon Owner

**Problem:** With multiple cron jobs sending alerts, usage prompts, and reports, the salon owner can receive 15-20 WhatsApp messages per day from the agent. Salon owners are busy with clients all day and cannot realistically check WhatsApp every 30 minutes. Message fatigue leads to the owner ignoring all messages, including critical stock alerts.

**Fix:** Consolidate messages aggressively. Instead of individual alerts, batch everything into 2-3 daily summaries: morning opening brief, midday check-in, and end-of-day report. Only send immediate alerts for truly urgent situations (out of stock on a product needed for today's appointments). Let the owner opt into more granular notifications rather than starting with maximum volume. Add a "quiet mode" instruction: "Between 10am and 6pm, only message me if something is URGENT for today's appointments."

---

## Maintenance Schedule

| Frequency | Task | Method |
|-----------|------|--------|
| Daily | Review morning stock alert | WhatsApp summary |
| Daily | Log product usage | WhatsApp replies during the day |
| Weekly | Review and approve reorder list | WhatsApp approval flow |
| Monthly | Physical inventory count | Guided count via WhatsApp + Google Sheet |
| Monthly | Run `skills-audit` | Check for permission drift |
| Quarterly | Review dead stock and expiring products | Monthly report analysis |
| Quarterly | Update supplier pricing in comparison sheet | Manual or agent-assisted research |
| Annually | Full inventory audit and system review | Compare agent records against physical count and financial records |

---

## Cost Considerations

- **API costs:** Low for this use case. Most operations use Google Sheets and WhatsApp, which are free or low-cost. `tavily-web-search` usage is minimal (10-20 searches per week for price checking). Budget $2-5/day in API costs.
- **Google Workspace:** Requires a Google account. Free tier is sufficient for most single-location salons.
- **Time investment:** Expect 2-3 weeks of daily interaction to calibrate usage patterns, reorder points, and the agent's understanding of the salon's specific product catalog. After that, the system becomes largely self-maintaining with weekly approval touchpoints.

---

## Multi-Location Considerations

### Expanding to 2-3 Locations

When a salon grows beyond a single location, inventory management becomes significantly more complex. Each location has its own backbar consumption rate, retail mix, and storage constraints. Adapt the setup as follows:

- **Separate inventory sheets per location.** Create a tab for each location's Current Inventory, but maintain a single consolidated Usage Log and Order History. This lets you track location-specific consumption while ordering centrally.
- **Inter-location transfers.** Add a "Transfer Log" sheet to track product moved between locations. When one location is overstocked on a product another location needs, the agent can suggest a transfer before placing a new order. Include columns: Date, From Location, To Location, Product, Quantity, Reason.
- **Location-specific reorder points.** A busy downtown salon may use 3x the developer of a suburban location. Set reorder points per location rather than using a single threshold.
- **Consolidated ordering.** Group orders across locations to meet minimum order requirements and maximize volume discounts. The weekly order preparation cron job should aggregate needs from all locations and present a single combined order per supplier.

### Staff-Level Tracking

For salons with 5+ stylists, per-stylist usage tracking reveals important patterns:

- **Product waste identification.** If one stylist consistently uses 2x the color of others for similar services, it may indicate waste, over-application, or a training opportunity.
- **Service profitability.** By linking product usage to specific services and the revenue they generate, the agent can calculate true per-service profitability after product costs.
- **Commission adjustments.** Some salon compensation models account for product usage. Accurate per-stylist tracking supports fair commission calculations.

To implement staff-level tracking, add a "Stylist" column to the Usage Log and modify the usage prompt to include the stylist name: "Who used the products? Reply with the stylist name and what they used."

### Seasonal Demand Planning

Salon product demand follows predictable seasonal patterns:

- **Prom and wedding season (April-June):** Spike in updo products, hairspray, heat protectant, and temporary color.
- **Back-to-school (August-September):** Increase in haircut volume (lower product usage per service but higher total volume).
- **Holiday season (November-December):** Retail gift set sales spike. Stock holiday packaging and gift-ready products early.
- **January:** Slowest month. Reduce reorder quantities to avoid overstocking.

Configure the agent to adjust reorder recommendations based on the month. Add a "Seasonal Multiplier" column to the inventory sheet: 1.0 for normal months, 1.3-1.5 for peak months, 0.7-0.8 for slow months. The weekly reorder cron job should apply this multiplier to its usage-based calculations.

---

## Related Guides

- `smallbiz_appointment_scheduling.md` — For linking inventory usage to the appointment calendar
- `finance_expense_tracking.md` — For tracking salon operating expenses beyond inventory
- `home_physical_inventory.md` — For general inventory management principles
