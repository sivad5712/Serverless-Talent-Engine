# 🤖 Automated Recruiter Pipeline

> **A serverless, zero-maintenance system that turns starred Gmail threads into a clean, deduplicated, auto-updating Google Sheet of recruiter contacts — no servers to manage, no laptop required, no manual data entry.**

[![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com)
[![Runtime](https://img.shields.io/badge/Runtime-V8%20JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developers.google.com/apps-script/guides/v8-runtime)
[![Hosting](https://img.shields.io/badge/Hosting-Serverless-00C7B7)](https://cloud.google.com/serverless)
[![Cost](https://img.shields.io/badge/Cost-%240%2Fmonth-success)]()
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 📑 Table of Contents

1. [The Problem](#-the-problem)
2. [The Solution](#-the-solution)
3. [Live Demo (Video)](#-live-demo-video)
4. [Voice Walkthrough (Audio)](#-voice-walkthrough-audio)
5. [Full Documentation (PDF)](#-full-documentation-pdf)
6. [Architecture Diagram](#-architecture-diagram)
7. [Data Flow Diagram](#-data-flow-diagram)
8. [The Output Sheet (Visual)](#-the-output-sheet-visual)
9. [How the Engine Thinks](#-how-the-engine-thinks)
10. [Quick Start (5 Minutes)](#-quick-start-5-minutes)
11. [Configuration Reference](#-configuration-reference)
12. [Design Decisions & Tradeoffs](#-design-decisions--tradeoffs)
13. [Tech Stack](#-tech-stack)
14. [Limitations & Known Issues](#-limitations--known-issues)
15. [FAQ](#-faq)
16. [License](#-license)

---

## 🔥 The Problem

Managing recruiter outreach as an in-demand engineer is its own job. The naive workflow looks like this:

```
┌─────────────────────────────────────────────────────────────┐
│                    THE OLD WORKFLOW (BAD)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   📧 Read email   →   ✂️  Copy name, email, phone           │
│                                                             │
│   📋 Paste into Excel   →   🧹 Reformat phone numbers       │
│                                                             │
│   👀 Scan for duplicates   →   💾 Save local file           │
│                                                             │
│   🔄 Repeat tomorrow. And the next day. And the next.       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**The hidden costs:**

| Pain Point | Real Impact |
|---|---|
| 🖥️ **Local file dependency** | Laptop closed = pipeline dead |
| ❌ **Human error** | Typos, missed contacts, inconsistent formatting |
| 🔁 **Duplicate entries** | Same recruiter logged 3 times across the month |
| ⏱️ **Repetitive labor** | 10–15 minutes a day = ~75 hours a year |
| 📵 **Mobile blind spot** | Can't add to Excel from a phone notification |

---

## ✅ The Solution

A serverless cloud pipeline that does it all autonomously.

```
┌─────────────────────────────────────────────────────────────┐
│                   THE NEW WORKFLOW (GOOD)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ⭐ Star an email on your phone                            │
│                                                             │
│   💤 Go about your day                                      │
│                                                             │
│   🤖 (Cloud handles everything at 5 PM)                     │
│                                                             │
│   📊 Open your Google Sheet — contact is already there      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Capability | How |
|---|---|
| ☁️ **Zero local dependency** | Runs entirely on Google's infrastructure |
| 🤖 **Fully autonomous** | Time-driven trigger fires daily at 5 PM |
| 🧹 **Self-cleaning data** | Regex parses + standardizes contact info |
| 🚫 **Auto-deduplication** | In-memory check against existing records |
| 📱 **Mobile-friendly capture** | Just star emails — no app, no input |
| 💸 **$0 / month** | Within Google's free tier forever |

---

## 🎬 Live Demo (Video)

A short walkthrough of the system in action — from starring an email on a phone to seeing the row appear in the sheet.

> **▶️ [Watch the Demo on Google Drive](PASTE_YOUR_VIDEO_DRIVE_LINK_HERE)**

<details>
<summary>📌 How to set the share link correctly</summary>

1. Upload the video to Google Drive
2. Right-click the file → **Share** → **General access** → **Anyone with the link**
3. Set permission to **Viewer**
4. Click **Copy link** and paste it above replacing `PASTE_YOUR_VIDEO_DRIVE_LINK_HERE`

</details>

---

## 🎧 Voice Walkthrough (Audio)

A spoken explanation of the project — the problem, the engineering choices, and the tradeoffs I weighed during design.

> **🎙️ [Listen to the Walkthrough on Google Drive](PASTE_YOUR_AUDIO_DRIVE_LINK_HERE)**

Topics covered:
- 🧩 Why I picked Apps Script over a Python cron job or hosted service
- 🏗️ The architectural choice between top-insertion vs. appending rows
- 🛡️ How deduplication is enforced before any write hits the sheet
- ⏱️ How I worked around Apps Script's 6-minute execution timeout

---

## 📘 Full Documentation (PDF)

A printable, polished setup guide with the full source code annotated end-to-end.

> **📄 [Open the Detailed Guide (PDF)](./Detailed_Guide.pdf)**

GitHub renders PDFs natively — clicking the link opens it in your browser.

---

## 🏛️ Architecture Diagram

The entire system, end to end:

```
                         ┌────────────────────────────────┐
                         │         👤  YOU (USER)         │
                         │  Stars an email on iOS/Android │
                         └────────────────┬───────────────┘
                                          │
                                          ▼
        ┌─────────────────────────────────────────────────────────┐
        │                   ☁️  GOOGLE CLOUD                      │
        │                                                         │
        │   ┌───────────────┐                                     │
        │   │   📧 GMAIL    │  ← Source of truth (starred items) │
        │   └───────┬───────┘                                     │
        │           │                                             │
        │           │ (Gmail API query: is:starred newer_than:2d) │
        │           ▼                                             │
        │   ┌────────────────────────────────────────┐            │
        │   │   ⏰  TIME-DRIVEN TRIGGER (5 PM daily) │            │
        │   └────────────────┬───────────────────────┘            │
        │                    │                                    │
        │                    ▼                                    │
        │   ┌────────────────────────────────────────┐            │
        │   │   ⚙️  APPS SCRIPT RUNTIME (V8 JS)      │            │
        │   │  ┌──────────────────────────────────┐  │            │
        │   │  │ 1. Fetch starred threads         │  │            │
        │   │  │ 2. Identify recruiter (not me)   │  │            │
        │   │  │ 3. Regex extract name/email/phone│  │            │
        │   │  │ 4. Standardize phone format      │  │            │
        │   │  │ 5. Dedup against existing rows   │  │            │
        │   │  │ 6. Prepend new rows to sheet     │  │            │
        │   │  └──────────────────────────────────┘  │            │
        │   └────────────────┬───────────────────────┘            │
        │                    │                                    │
        │                    ▼                                    │
        │   ┌────────────────────────────────────────┐            │
        │   │   📊  GOOGLE SHEET (master DB)         │            │
        │   │   Auto-updated, deduplicated, sorted   │            │
        │   └────────────────────────────────────────┘            │
        │                                                         │
        └─────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                         ┌────────────────────────────────┐
                         │   📱 You check the sheet       │
                         │   from any device, anywhere    │
                         └────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

Following a single starred email through the pipeline:

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  STAGE 1: INGEST                                               │
│  ─────────────────                                             │
│  Gmail.search("is:starred newer_than:2d")                      │
│                                                                │
│         ↓  returns: GmailThread[]                              │
│                                                                │
│  ─────────────────────────────────────────────────────────     │
│                                                                │
│  STAGE 2: ISOLATE THE RECRUITER MESSAGE                        │
│  ──────────────────────────────────────                        │
│  Walk thread BACKWARDS, find first message NOT from "me"       │
│                                                                │
│   ┌─────────────────────────────┐                              │
│   │ Msg #4: from ME (my reply)  │  ← skip                      │
│   │ Msg #3: from recruiter      │  ← ✅ USE THIS               │
│   │ Msg #2: from ME             │  ← skip                      │
│   │ Msg #1: from recruiter      │  ← skip (older)              │
│   └─────────────────────────────┘                              │
│                                                                │
│         ↓                                                      │
│                                                                │
│  ─────────────────────────────────────────────────────────     │
│                                                                │
│  STAGE 3: PARSE & SANITIZE                                     │
│  ─────────────────────────                                     │
│  RAW INPUT:                                                    │
│    "Hi, I'm Sarah Chen from Acme. Reach me at                  │
│     sarah.chen@acme.io or (415) 555.2847"                      │
│                                                                │
│         ↓ regex pipelines                                      │
│                                                                │
│  STRUCTURED OUTPUT:                                            │
│    name:  "Sarah Chen"                                         │
│    email: "sarah.chen@acme.io"                                 │
│    phone: "415-555-2847"  ← standardized                       │
│                                                                │
│  ─────────────────────────────────────────────────────────     │
│                                                                │
│  STAGE 4: DEDUPLICATE                                          │
│  ────────────────────                                          │
│  existingEmails = [...current sheet column C...]               │
│                                                                │
│  if (existingEmails.includes("sarah.chen@acme.io"))            │
│      → SKIP (already in DB)                                    │
│  else                                                          │
│      → PROCEED to write                                        │
│                                                                │
│  ─────────────────────────────────────────────────────────     │
│                                                                │
│  STAGE 5: PREPEND TO SHEET                                     │
│  ─────────────────────────                                     │
│  • Unmerge previous header                                     │
│  • Insert N+3 blank rows at top                                │
│  • Write new dated header at row 2                             │
│  • Write recruiter rows starting at row 3                      │
│                                                                │
│  Result: Newest data is ALWAYS at the top of the sheet         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 The Output Sheet (Visual)

What the Google Sheet looks like after a few daily runs:

```
╔════════════════════════════════════════════════════════════════════════════════╗
║ A: Date Exported │ B: Recruiter Name │ C: Emails       │ D: Phones │ E: Subj.. ║
╠════════════════════════════════════════════════════════════════════════════════╣
║ ───── NEW RECRUITERS FOUND ON: NOVEMBER 14, 2025 ─────                         ║
║ 2025-11-14 17:00 │ Sarah Chen        │ sarah@acme.io   │ 415-555-… │ Senior... ║
║ 2025-11-14 17:00 │ Marcus Liu        │ marcus@triton…  │ 650-555-… │ Staff E.. ║
║                                                                                ║
║ ───── NEW RECRUITERS FOUND ON: NOVEMBER 13, 2025 ─────                         ║
║ 2025-11-13 17:00 │ Priya Raman       │ priya@nexus.co  │ 408-555-… │ Backend.. ║
║                                                                                ║
║ ───── NEW RECRUITERS FOUND ON: NOVEMBER 12, 2025 ─────                         ║
║ 2025-11-12 17:00 │ David Park        │ d.park@volt.io  │ 212-555-… │ Platform. ║
║ 2025-11-12 17:00 │ Elena Vasquez     │ elena@orbit.dev │ 617-555-… │ Distrib.. ║
║                                                                                ║
║ ───── FULL HISTORY BACKFILL COMPLETED: NOVEMBER 11, 2025 ─────                 ║
║ 2025-11-11 14:23 │ (all historical recruiters loaded here on first install)    ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

**Key visual properties:**
- 🔝 **Newest data on top** — no scrolling required
- 📅 **Daily section headers** — visually segmented like a news feed
- 🔗 **Subject column links back to original Gmail thread** (formula-driven)
- 🧼 **Standardized formatting** — every phone in `XXX-XXX-XXXX`

---

## 🧠 How the Engine Thinks

A peek at the decision logic for each thread:

```
                  ┌────────────────────────┐
                  │  Pull starred thread   │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Walk thread backwards  │
                  │ Find latest non-me msg │
                  └───────────┬────────────┘
                              │
                       ┌──────┴──────┐
                       │             │
                  Found?  YES     NO → SKIP THREAD
                       │
                       ▼
                  ┌────────────────────────┐
                  │  Extract sender name   │
                  └───────────┬────────────┘
                              │
                       ┌──────┴──────┐
                       │             │
                 Name valid? YES   NO → SKIP
                       │
                       ▼
                  ┌────────────────────────┐
                  │ Regex: emails + phones │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   Email exists in DB?  │
                  └───────────┬────────────┘
                              │
                       ┌──────┴──────┐
                       │             │
                       NO          YES → SKIP (dup)
                       │
                       ▼
                  ┌────────────────────────┐
                  │ Queue row for write    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ After all threads:     │
                  │ Prepend batch to sheet │
                  └────────────────────────┘
```

---

## ⚡ Quick Start (5 Minutes)

### 🎯 Step 1 — Create Your Master Database

1. Go to [Google Drive](https://drive.google.com) → **+ New** → **Google Sheets**
2. In **Row 1**, add these column headers:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Date Exported | Recruiter Name | Emails | Phones | Subject | Link to Email |

3. Bold Row 1 and freeze it: **View → Freeze → 1 row**
4. Copy the **Spreadsheet ID** from your URL:

```
https://docs.google.com/spreadsheets/d/  1aBcDeFgHi...XyZ  /edit
                                         ↑               ↑
                                         └─ THIS PART ───┘
```

---

### ⚙️ Step 2 — Deploy the Cloud Code

1. From your sheet: **Extensions → Apps Script**
2. Delete any boilerplate
3. Paste the contents of [`ScraperEngine.js`](./ScraperEngine.js)
4. Edit the two config lines at the top:

```javascript
const SPREADSHEET_ID = "PASTE_YOUR_ID_HERE";
const MY_NAME        = "Your Full Name";   // Filters out your own replies
```

5. **Save** (💾 icon)

---

### 🔓 Step 3 — Authorize & Backfill History

1. In the function dropdown at the top, select **`runOneTimeBackfill`**
2. Click **▶ Run**
3. Google asks for permission:

```
Review Permissions → Choose your account → Advanced
  → Go to (project name) (unsafe) → Allow
```

> ⚠️ The **"unsafe"** warning is normal — it only means the script isn't Google-verified. You're authorizing your own code to access your own data. Nothing leaves your account.

4. Check your sheet — every starred recruiter from history is now there.

---

### 🤖 Step 4 — Schedule the Daily Autopilot

1. In the Apps Script editor sidebar, click the **⏰ Triggers** icon
2. Click **+ Add Trigger** (bottom right)
3. Configure:

| Setting | Value |
|---|---|
| Function to run | `runDailyScraper` |
| Event source | `Time-driven` |
| Type of trigger | `Day timer` |
| Time of day | `5pm to 6pm` |

4. Click **Save**

✅ **Done.** You will never touch this system again. Star recruiter emails on your phone — by 6 PM, they're in the sheet.

---

## 🔧 Configuration Reference

| Constant | Purpose | Default |
|---|---|---|
| `SPREADSHEET_ID` | Your Google Sheet's ID from its URL | *(required)* |
| `MY_NAME` | Used to skip your own outbound replies | *(required)* |
| `QUERY_DAILY` | Gmail search for the daily run | `in:inbox is:starred newer_than:2d` |
| `QUERY_BACKFILL` | Gmail search for the one-time historical pull | `in:inbox is:starred` |

**Want to customize?** Swap `is:starred` for any Gmail operator:
- `label:recruiters` — only emails with that label
- `from:linkedin.com` — only LinkedIn outreach
- `subject:opportunity` — keyword filter
- Any combination

---

## 🧩 Design Decisions & Tradeoffs

### 1️⃣ Why Apps Script over Python cron / a hosted service?

| Option | Pros | Cons |
|---|---|---|
| 🖥️ Local Python cron | Full language control | Laptop must be on; setup overhead; auth complexity |
| ☁️ Hosted service (Lambda, etc.) | Scalable, professional | Costs money; needs Gmail OAuth flow; deployment work |
| ✅ **Apps Script** | **Free, native Gmail/Sheets access, zero infra** | **Locked to Google ecosystem; 6-min runtime cap** |

**Verdict:** The data already lives in Google. Putting compute in the same ecosystem eliminates auth complexity, hosting cost, and deployment overhead.

---

### 2️⃣ Why prepend rows instead of appending?

```
APPEND (typical)              PREPEND (chosen)
──────────────────            ──────────────────
[Old data row 1]              [── NEW: Today ──]
[Old data row 2]              [Today's row 1  ]
[Old data row 3]              [Today's row 2  ]
[...500 more...]              [── Yesterday ──]
[Today's row 1] ← scroll      [Old data row 1 ]
[Today's row 2]   forever     [Old data row 2 ]
```

**Tradeoff:** Prepending costs an extra `insertRowsBefore` + header rewrite per run. At realistic volumes (a handful of recruiters per day), this is negligible. Worth it for the UX win.

---

### 3️⃣ Why deduplicate on first email only?

The script reads column C into memory, then checks each new contact's first email against it. **It's not bulletproof** — a recruiter using two different addresses will appear twice — but it catches 95% of the actual problem (the same person blasting you with multiple follow-ups).

A more aggressive dedup (fuzzy name matching, phone number cross-checking) was rejected because false positives are worse than false negatives here. Missing a duplicate = one extra row. Bad fuzzy match = a real recruiter never gets logged.

---

### 4️⃣ Why two functions for daily vs. backfill?

Apps Script enforces a **strict 6-minute timeout** on serverless executions:

```
Daily run    (~50 emails)   →   ~3 seconds      ✅
Backfill   (1000s emails)   →   could exceed    ❌
```

Splitting them lets the daily trigger be lightweight while the (one-time) backfill runs under explicit user supervision. If your mailbox has 10k+ starred items, the backfill function can be batched further.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Google Apps Script (V8 JS) | Native Gmail + Sheets bindings, free hosting |
| **Storage** | Google Sheets | Zero setup; queryable via API; sharable |
| **Trigger** | Apps Script Time Triggers | Managed cron — no server needed |
| **Auth** | OAuth 2.0 (auto-prompted) | `gmail.readonly` + `spreadsheets` scopes |
| **Parsing** | Custom Regex | Phone formats, emails, sender names |
| **Source** | Gmail API | First-class integration via `GmailApp` |

**Total external dependencies:** Zero.
**Total infra to manage:** Zero.
**Total cost:** $0 / month (Google free tier).

---

## ⚠️ Limitations & Known Issues

Honest list. Read these before deploying:

- 🪞 **Naive dedup.** Matches on first email address only. Same person, different email address = duplicate row.
- ⏱️ **6-minute Apps Script timeout.** Backfills across very large mailboxes (10k+ starred threads) may need manual batching.
- 🌐 **US-centric phone regex.** International numbers outside the `+1` pattern won't be standardized (still captured if they match the pattern, otherwise dropped).
- 🔇 **No failure notifications in-script.** If a run fails, you find out by noticing the sheet didn't update. Apps Script *does* email you on script errors automatically, but it's easy to miss.
- 📊 **Reads entire column C every run.** Fine for thousands of rows. At 100k+ rows, refactor to read only a constrained range.
- 🔐 **Single-user system.** Auth scopes tie this to one Google account. Not designed for shared/team use without modification.

---

## ❓ FAQ

<details>
<summary><strong>Does my laptop need to be on for this to work?</strong></summary>

No. The trigger runs on Google's servers. Your laptop can be closed, off, or sitting at the bottom of the ocean.

</details>

<details>
<summary><strong>Will it spam my sheet if I re-star old emails?</strong></summary>

No. The dedup check skips any email already in column C, no matter how many times it gets re-starred.

</details>

<details>
<summary><strong>Can I use this for something other than recruiters?</strong></summary>

Yes. Change the Gmail query (`QUERY_DAILY` / `QUERY_BACKFILL`) to match anything: customer leads, vendor outreach, networking contacts, conference invites. The script doesn't care about the *meaning* of the emails — only their structure.

</details>

<details>
<summary><strong>Is my Gmail data going anywhere external?</strong></summary>

No. The script runs entirely inside your own Google account. Nothing leaves Google's servers. There are no third-party APIs, no telemetry, no external storage.

</details>

<details>
<summary><strong>Why does Google call the script "unsafe" during authorization?</strong></summary>

Because it hasn't gone through Google's formal OAuth verification process — standard for personal scripts. You're explicitly granting your own script access to your own data. The warning is a safety net for scripts you didn't write yourself.

</details>

<details>
<summary><strong>What if I want it to run more often than daily?</strong></summary>

In the Triggers panel, change the trigger type to `Hour timer` and pick an interval (every 1, 2, 4, 6, 8, or 12 hours). The script's logic doesn't change — it'll just process more frequent, smaller batches.

</details>

<details>
<summary><strong>Can I extend this with more fields (LinkedIn, company, role)?</strong></summary>

Absolutely. Add a column to the sheet, write a regex (or use the email domain as a company proxy), and append the extracted value to the `rowsToAppend` array in `processEmails()`.

</details>

---

## 📜 License

[MIT](LICENSE) — fork it, modify it, ship it. Attribution appreciated, not required.

---

<p align="center">
  <strong>Built to remove a chore.<br/>Now removes itself from your attention entirely.</strong>
</p>

<p align="center">
  ⭐ If this saved you time, star the repo so others can find it.
</p>
