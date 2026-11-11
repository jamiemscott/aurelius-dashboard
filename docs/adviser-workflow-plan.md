# Adviser workflow — plan

Status: in progress · 11 November 2026 · follows PR #202 (adviser dashboard)

**Progress**
- Section 1 (CSS gaps) is done in PR #203. Every gap was a consolidation: no new tokens, since `--status-warning` already existed and only needed an AA-safe light-mode value. For KPI clipping, stacking the cards at ≤480px beat a container query, because the query also shrank short values like "12".
- Section 2, pages 1–2 (Client Book and Client 360) are in PR #204, stacked on #203. Client 360 is one template that serves every client via a rewrite (`serve.json` and `netlify.toml`), not just Sumant. Holdings scale to each client's value.
- Section 2, page 3 (Advice Requests) is in PR #205. No new components: `doc-entry` rows (now allowed to be `<button>`s), the shared wide drawer, and the chat thread and composer from `adviser.css`. Rows can be deep-linked as `/advice-requests/#<ref>`, which the dashboard uses.

## 1. CSS gaps from the dashboard

None of these needs a brand-new component. Four of them already exist as near-duplicates spread across page modules. The cleanest fix is to **consolidate** them into one shared component each, as PR #200 did for drawers.

### 1a + 1b. Tier badge and warning status → one shared `status-tag`

There are six pill/badge implementations today:

| Class | Module | Tones |
|---|---|---|
| `.status-tag` | cards.css | neutral, `--up`, `--down` |
| `.gl-status` | goals.css | `--good`, `--warn`, `--bad`, `--complete` |
| `.det-status-badge` | details.css | `.is-success`, `.is-failed` |
| `.det-verified-badge` | details.css | green only |
| `.det-tag` | details.css | neutral |
| `.doc-new-tag` / `.doc-group-badge` | documents.css | gold, solid |

**Proposal:** extend `.status-tag` with the full tone set: `--up`, `--down`, `--warn` (amber), `--gold`, and the neutral default. Then migrate `gl-status` and `det-status-badge` onto it, and delete the duplicates.
- "Due soon" uses `status-tag--warn`.
- For tiers, only Platinum is worth highlighting (`status-tag--gold`). Gold, Silver and Bronze stay plain text. Colour-coding all four tiers adds noise, and bronze/silver colours fail contrast in light mode.
- Open question: does `--warn` need a new token pair (`--amber` / `--amber-dim`)? goals.css hard-codes `#FBBF24`. A token would fix that too.

### 1c. KYC status column
This is solved by 1a: `status-tag--up` for Verified, `--warn` for Expiring and `--down` for Expired. No new CSS.

### 1d. Empty state → one shared component
There are three today: `.doc-empty` (documents), `.np-empty` (notifications) and `.chat-empty` (adviser). **Proposal:** promote `.doc-empty` to a shared `.empty-state` (icon, title and line of copy) and point the other two at it. The adviser tables need it for "No KYC documents expiring" and "No advice requests".

### 1e. `.kpi-value` clipping long figures
**Proposal:** shrink the type for long values using a container query on `.kpi-card`, which is a change to the existing component. The alternative is to format AUM as `£6.89m` in the markup. My recommendation is the container query, because client portfolios on the customer side will hit the same problem.

---

## 2. Workflow pages

All pages live under `/adviser-dashboard/james-whitmore/…`. The table shows the suggested build order, with the components each page reuses.

| # | Page | What the adviser does there | Reuses | Possibly new |
|---|---|---|---|---|
| 1 | **Client Book** `/clients/` | Find any client, sort and filter the book. The ODC columns are Client, Tier, Role, Total value, Cash, Gain/loss, Last activity, Next review, KYC. | `table-wrap`, `doc-search-wrap`, `filter-row` / `filter-select`, `doc-tabs` (All · Platinum · Gold · Needs attention), `doc-stats-strip`, `status-tag` | Sortable column header (`th` button and `aria-sort`). Needed by every list from here on. |
| 2 | **Client 360** `/clients/sumant-kumar/` | Everything about one client on one screen: portfolio, profile, KYC, goals, documents and contact history. | Almost the whole customer site: KPI strip, performance chart, donut, holdings table, `det-section` profile blocks, `det-kyc-status`, goals cards, `doc-entry` list, `activity-item` timeline. Sumant already has full data in `data.js`. | Nothing. It's mostly reuse. |
| 3 | **Advice Requests** `/advice-requests/` | Triage the inbox, open a request, reply, and convert it into a task or review. | `doc-group` (grouped by status), `doc-tabs`, unified `drawer` + `field` forms, `adv-msg` / `adv-bubble` for the thread, `drawer-success` | Nothing. |
| 4 | **Reviews & Meetings** `/reviews/` | See the review pipeline and run a review: prepare, meet, write the suitability report, sign off. | `steps` / `step-connector` for the review stages, `review-card` / `review-row`, `doc-group` grouped by week, `feedback-message-warning` for overdue | A diary or agenda view. Start as a grouped list and only build a calendar grid if you want one. |
| 5 | **KYC & AML** `/compliance/kyc/` | Chase expiring documents, upload new ID, and see risk ratings. | Tables, `status-tag`, `file-upload`, `det-kyc-status`, drawer form | Nothing. |
| 6 | **Secure Messages** `/messages/` | The adviser's side of "Message Adviser". | `adviser.css` chat components (already built for the client side), list from `doc-entry` | A two-pane inbox layout (list plus thread). Could be `two-thirds-split--reversed`. |
| 7 | **Suitability Reports** `/compliance/suitability/` | Draft, send and track signed reports. | `doc-entry` list, `steps`, forms, `form-success` | Nothing. |
| 8 | **Tasks** `/tasks/` | Personal to-do list, plus tasks generated from reviews, KYC and requests. | Table or `doc-group` list, `det-check` checkboxes | Possibly. `tasks/tasks.css` is the internal dev board with page-local CSS, so it isn't reusable as it stands. |
| 9 | **Pipeline** `/pipeline/` | Prospects moving from enquiry to fact-find to proposal to onboarded. | KPI strip, `doc-tabs` per stage | A kanban column layout, which is genuinely new. A table grouped by stage avoids it. |
| 10 | **Fees & Revenue** `/practice/fees/` | Recurring fee income, AUM trend, and fees by client. | KPI strip, Highcharts (as on Plan My Future), tables | Nothing. |

### Suggested first PR
Pages 1 and 2 together, Client Book plus Client 360, with every client name on the dashboard linking through to them. That gives the adviser flow a click path straight away and needs only the sortable header and the `status-tag` consolidation.

## 3. Structure decisions to confirm

1. **Data.** Move the adviser book into `src/js/adviser-data.js` so the dashboard, Client Book and Client 360 all read the same 12 clients and the numbers can't drift. This keeps the markup static but rendered from data, the same pattern as `buildTopHoldings()`.
2. **Client 360 scope.** Build one fully detailed client (Sumant Kumar, who already has full data) and leave the other names linking to the same template for now.
3. **Style guide.** Add an "Adviser" page to `/style-guide` documenting the consolidated `status-tag` tones, `.empty-state` and the sortable header.
4. **Branches.** Use `feat/status-tag-consolidation` (refactor) first, then `feat/adviser-client-book` for pages 1–2.
