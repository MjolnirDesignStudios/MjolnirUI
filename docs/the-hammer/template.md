# The Hammer — Build in Public Template
> Reusable structure for the monthly MjolnirUI Build in Public post.
> Drops the last Thursday-ish of each month at 9 AM ET on X / LinkedIn / blog.

## Header

```
🔨 The Hammer · <Month YYYY>
<one-line hook — what made this month feel different>
```

Example hook lines:
- "The first 25 days of MjolnirUI Pro."
- "Charts week was supposed to be one drop. It became three."
- "A month of shipping with one person + one keyboard."

---

## Section 1 — What shipped (the receipts)

Brutal honesty + specific dates. No "lots of progress" hand-waving.

```markdown
### Shipped in <Month>

**Components added** (X new, library now at <Y>):
- <Date or week>: <Component> — <one-line description>
- ...

**Tooling / platform**:
- <Date>: <Feature> — <one-line>

**Behind the scenes** (bug fixes, perf, infra):
- <One-line each>

Total commits to `main`: **<N>** · Lines changed: **<+M / -P>**
```

> ⚙️ How to fill: `git log --since="<start>" --until="<end>" --oneline | wc -l` for commits; check `componentRegistry.ts` for component count.

---

## Section 2 — The numbers

Pull from `/admin/dashboard` on the morning of the post. Be honest — if a number's bad, say so. Build in public means showing the dent, not hiding it.

```markdown
### Numbers — <Month>

| Metric | <Month> | vs. <Prev Month> |
|--------|---------|------------------|
| Total signups | X | +Y% |
| Free → Paid conversion | X% | ±Yp |
| MRR (Stripe) | $X | +$Y |
| New paid customers | X | — |
| MDS cross-grants applied | X | — |
| Most-opened tool | <name> | — |
| Components in library | X | +Y |
```

> 📊 Source: `/admin/dashboard` panels — Total users / Paid users / MRR card / Popular Tools / Activity timeline.

---

## Section 3 — The story (1 thing that surprised you)

Pick **one** moment from the month that didn't go to plan. The post lives or dies here. Examples worth telling:

- A bug that taught you something about the stack
- A feature that wasn't on the roadmap that users asked for
- A pricing experiment + result
- A perf cliff + the fix
- A user email that changed the trajectory

```markdown
### The lesson — <pithy 5-word title>

<2-3 paragraphs. First person. Specific. No "lessons learned" preamble —
just tell the thing.>
```

> 🪶 Voice: 1st person singular. Specific over general. "I" not "we". One concrete artifact (code snippet, screenshot, exact email subject) makes the post real.

---

## Section 4 — What's next (commitment + caveat)

Lock in next month's flagship + acknowledge what could break it.

```markdown
### Next month — <next-month single-word theme>

The plan:
1. <Major drop 1>
2. <Major drop 2>
3. <Marketing push>

What could derail it:
- <Realistic risk #1>
- <Realistic risk #2>

I'm tracking it in `docs/roadmap-2026.md`. Watch.
```

---

## Section 5 — CTA

```markdown
### Try it / pay for it / send me an email

- **Free tier (5 unlocks):** [mjolnirui.com](https://mjolnirui.com)
- **Pro ($25/mo):** [mjolnirui.com/#pricing](https://mjolnirui.com/#pricing)
- **MDS subscribers:** Pro is already yours — sign in with the email
  on your MDS subscription
- **Feedback / bugs:** reply to this post or
  [contact@mjolnirdesignstudios.com](mailto:contact@mjolnirdesignstudios.com)
```

---

## Cross-platform copy

Each post → 3 versions, written specifically (not just "trimmed"):

| Platform | Length | Tone | Hero artifact |
|----------|--------|------|---------------|
| **X / Twitter** | 7-12 tweet thread | Punchy, 1 metric per tweet, image per tweet | Promo video clip (15s) |
| **LinkedIn** | 1,500-2,500 chars, single post | Reflective, founder-voice, no jargon | Single dashboard screenshot |
| **Blog / Substack** | The full template above | Long-form, all sections, code snippets OK | The hero composition image |

---

## Editorial checklist (do this BEFORE posting)

- [ ] Numbers are pulled from prod, not test mode
- [ ] Every claim has a date or commit hash backing it
- [ ] The "surprise" section is actually about something that surprised you
- [ ] Next month's plan is in `docs/roadmap-2026.md` so you can be held to it
- [ ] No "lots of progress" / "exciting things" filler — every sentence does work
- [ ] One artifact (video, screenshot, code) per section
- [ ] Spell-checked
- [ ] CTA buttons go to the right URLs (not localhost, not test mode)
- [ ] Schedule the post — don't fire-and-forget at 11pm

---

## Cadence

- **Drop day:** Last Thursday of the month, 9 AM ET
- **Write day:** Tuesday before drop (gives 24h cushion for edits)
- **Metrics-pull day:** Tuesday morning (capture state, write narrative)
- **Pre-write day:** The Friday before drop (outline + identify "the surprise")
