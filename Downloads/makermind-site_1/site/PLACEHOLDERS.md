# MakerMind Tutoring — what still needs your input

The form and the booking calendar are now wired to your real accounts and
working. Two things remain, both waiting on something outside the code.

---

## Done — your live services are connected

Both are configured in `assets/config.js`, which stays the only file you
need to touch if either ever changes.

| | |
|---|---|
| **Enquiry form** (Contact page) | Posts to `https://formspree.io/f/xppaeawd`. Submissions arrive in the inbox registered on that Formspree form; the visitor sees an inline thank-you and the page never reloads. Every field is sent, plus `_replyto` so you can reply straight from the email. |
| **Booking calendar** | Embeds `calendly.com/enquiries-makermindtutoring/30min` on the Book page. Visitors can only pick times you are genuinely free, and every booking lands in your Calendly dashboard and syncs to your calendar. The old placeholder picker with its fake availability is gone from both pages. The cookie banner is hidden and the embed is framed to sit inside the page. |

**Send yourself one test enquiry** from the live site once it is up.
Formspree usually asks you to confirm the first submission before it
starts forwarding, and that is the only step I cannot do for you.

If Calendly is ever unreachable, the calendar area falls back to a short
message pointing at 0435 285 530 rather than showing an empty box. The
enquiry form keeps working regardless.

### Where each page sends people

| Page | What it does |
|---|---|
| **Book a consult** (`book.html`) | The Calendly calendar and nothing else. It carries its own questions now, so the page no longer asks for the same details a second time. Calendly's header is showing, which is what keeps the duration picker available. |
| **Contact** (`contact.html`) | Its own enquiry form, posting to Formspree — for people who want to ask something without booking a slot. A line under the fields links across to the booking page for anyone who would rather just pick a time. |

A booking that came from a scanned business card is tagged
`utm_campaign=first-session-free`, so those show up marked in your
Calendly dashboard and you know to apply the free first session.

### Two things worth changing in Calendly

- The event is called **"Enquiry form"**, which is what an invitee sees in
  their confirmation email and calendar entry. Something like "Free
  consult — MakerMind Tutoring" would read better.
- It currently defaults to **1 hr**. Invitees can pick a shorter option
  from the duration row, but the default is what most will accept without
  thinking. Setting the default to 30 min matches what the site advertises.

If you ever want the compact calendar back — no header, no duration row —
set `hideDetails: true` in `assets/config.js` and drop `height` to about
`560`. Be aware that hiding the header also hides the duration picker, so
Calendly would book the event's default length without asking. The picker
cannot be moved elsewhere on the page: the scheduler is an iframe served
from Calendly's domain, so nothing on this site can reach inside it.

---

## 1. Waiting on the domain

| What | Where |
|---|---|
| **Social links** | `contact.html` — the Instagram, Facebook and YouTube buttons all point at the literal string `SOCIAL_PLACEHOLDER`. Replace with real URLs or delete the three buttons. |
| **Hero background video** | `index.html` looks for `images/brainstorm-slowmo.mp4` / `.webm` and `images/hero-poster.jpg`. Create an `images/` folder beside the HTML and drop them in. Entirely optional — without them the hero shows the plum panel, which is how it looks now. |

## 2. Waiting on real customers

| What | Where |
|---|---|
| **The three testimonials** | `index.html`, "What students, parents and mentors say". These are **written sample quotes, not real feedback** — marked `SAMPLE COPY` in the file. Swap each `<q>` and byline as genuine comments come in. Until then they should not be presented as real, so consider deleting the section if the site goes live before you have any. |

---

## Confirmed and set

- **"Background-checked tutors"** — confirmed true, kept on the homepage.
- **November booking deadline** — confirmed, kept in the announcement bar.
- **Response time** — "we reply within two business days", everywhere.
- **Prices** — $80 per 60-minute session, $260 per month for weekly
  tutoring, 24-hour reschedule window, free consult.
- **Team coaching** — quoted per season, no figure shown. Add one if you
  would rather be upfront about it.

## Changes I made earlier, for the record

- **Removed the skill rating bars** from the About page.
- **Removed invented credentials.** An early draft claimed "10+ years
  coaching", "200+ students coached to date", "15 regional / state
  awards" and "30+ competitions attended". I wrote those as placeholders
  and they cannot be true of two current students, so the homepage stat
  strip now carries facts that are — $80 a session, 1:1 or small-team,
  years 7–12, Canberra — and the About stats table is gone.
- **Removed named testimonials** — "Jordan M.", "Renee P." and "David K."
  were invented people.
- **Two mechanical fixes to your Who we are copy** — added the missing
  colon after "Tutor Jimmy", and "18yrs old" → "18 years old". Everything
  else on that page is your wording, unchanged.

- **Removed every mention of FIRST, FRC, FTC and FLL** across the site, the
  business card and the social kit, at your instruction — you are not
  sponsored by or partnered with FIRST and have not competed in their
  events. Copy now says "robotics competition coaching" and the curriculum
  chips list real subjects. The footer line "Not affiliated with or
  endorsed by FIRST" went too; with no reference to them anywhere, a
  disclaimer would only reintroduce the association.
- **Java changed to C++** in the subject list and programme copy, to match
  the languages in your own Who we are page.
- **Removed "physics" everywhere** and **added Java** to the languages, at
  your instruction. The subject chips, the programme lists, the FAQ and
  every meta description now read engineering, CAD, C++, Python, Java and
  electronics.
- **"We bring the parts" and similar became "expansive hardware
  catalogue"** across the site, the social bios and the post ideas.
