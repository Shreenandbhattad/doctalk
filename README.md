# DocTalk

Say it out loud once, in private, and see it clearly.

Some symptoms are hard to say to anyone. You search them at 2am, then freeze in
the clinic and tell half the story. DocTalk is a quiet place to say the whole
thing, once, to something that is not listening back. It asks the follow ups
that decide what a symptom means, and hands you your story on one page.

**Live:** https://shreenandbhattad.github.io/doctalk/

Not a diagnosis. Nothing leaves the phone.

## How it works

A short welcome asks your name, age band and what you want close at hand, then
the app is four tabs.

- **Home**: a greeting by name, your watched areas, quick tools and recent reads.
- **Talk**: tap the orb and speak. English by default, Hinglish if you switch it in You. A ring fills as your story
  gets complete and four petals open as you cover when, how bad, what you tried
  and what it affects.
- **Tools**: prescription reader, interaction check, a library of thirteen
  condition areas, and a plain list of signs that mean today.
- **You**: your details, saved reads, settings and a clear everything button.

Every talk ends in a read with an urgency band, the story in order, what a
doctor will weigh, what is usually checked and three things worth asking.

## What it listens for

Six things decide what a symptom means, and the interviewer asks for whichever
is still missing, one at a time.

| Slot | Pulled from phrases like |
| --- | --- |
| How long | teen mahine se, 2 weeks, ek saal |
| How bad | 7 out of 10, bahut zyada, thoda sa |
| Pattern | badh raha hai, kabhi kabhi, waisa hi |
| Tried | minoxidil, shampoo, gharelu nuskha, tablet |
| Affects | neend, kaam, confidence, bahar jaana |
| History | ghar me papa ko bhi tha, pehle bhi hua |

It also works out the area on its own, so hair, skin, periods, sexual health,
gut, sleep, mood and pain each get their own follow ups and their own questions
on the card.

Everything on the card comes out of your own words, and you see each line
appear as you say it.

## Safety

Some things stop the flow rather than get summarised. Chest pain with
breathlessness, heavy bleeding, sudden vision loss, fever in a small baby,
stroke signs, and thoughts of self harm. That last one shows Tele MANAS, 14416,
free and open all day.

No diagnosis, no dosing, no prescribing. Medicine explanations say what a thing
is and when it is usually taken, and every card says to confirm with a
pharmacist or doctor.

## Voice

Speech becomes text in the browser itself, through the built in engine. Nothing
is recorded, nothing is uploaded, and there is no model to download, so the app
opens instantly on any phone. Where the microphone is not available, which
includes most embedded previews and some browsers, it falls back to typing and
the rest of the app is identical.

The orb reacts to real microphone amplitude through a Web Audio analyser, so it
is moving to your actual voice rather than to a timer.

## Prescriptions

Photograph one and it finds the lines of writing by looking at horizontal
gradient, with no OCR involved. Handwriting cannot be read reliably by anything,
so instead of guessing it asks you to confirm each name, then explains what the
medicine is, when it is usually taken, and what to watch for.

## Running it

```
python3 -m http.server 8000     serve it
node test/run.js                drive the app headless
```

The test loads the real module files, runs a six turn Hinglish story through the
interviewer, checks the extracted slots, fires the red flag cases, builds a
card, checks the copy filter and renders the screens.

## Files

```
index.html          shell
app.css             tokens, layout, motion
js/core.js          state, formatting, sheets
js/orb.js           the orb and the completeness ring
js/speech.js        microphone and captions
js/interview.js     slot filling, follow ups, red flags
js/card.js          the card, text and image export
js/scan.js          prescriptions and the medicine list
js/app.js           screens and navigation
```

## Privacy

No account and no server. Your name, saved reads and settings live in this
browser only, and clearing everything is one tap in the You tab.
