# 📖 SAIYAN PROTOCOL — Glossary

A reference for all the DBZ-themed terminology, training concepts, and technical terms used throughout the app.

---

## App-Specific Terms

### KAKAROT
The AI training coach and core intelligence behind Saiyan Protocol. Named after Goku's Saiyan birth name. Speaks in two voices: a clinical system voice for workout instructions, and the Master Roshi coaching voice for debriefs and notes.

### Master Roshi
The coaching persona used for weekly debriefs, session notes, and motivational feedback. Wise, direct, slightly sardonic. References DBZ lore as metaphor. Never preachy — always ends on action, not motivation.

### Power Level
A gamified score that tracks overall training progress. Increases with every completed session based on effort rating, workout difficulty, completion ratio, and streak bonus. Ranges from 1000 (starting) to 10000+.

**Formula:** `(effort × 10) × difficultyMultiplier × completionBonus × streakMultiplier`

### Power Tiers
Named progression levels based on Power Level score:

| Tier | Power Level | Reference |
|------|-------------|-----------|
| Saiyan | 1000+ | Base Saiyan form |
| Super Saiyan | 1500+ | First SSJ transformation |
| SSJ2 | 3000+ | Second SSJ transformation |
| SSJ3 | 5000+ | Third SSJ transformation |
| SSJ Blue | 7500+ | Super Saiyan Blue (God Ki) |
| Ultra Instinct | 10000+ | Autonomous Ultra Instinct |

### Difficulty Multipliers
Scaling factors applied to power gain based on workout type:

| Workout Type | Multiplier |
|-------------|-----------|
| Long Run | 1.0 |
| Tempo Run | 1.2 |
| Calisthenics | 1.3 |
| Interval Run | 1.5 |
| CrossFit WOD | 1.8 |
| Benchmark WOD | 2.5 |

### Streak
Consecutive days with a completed session. Adds a bonus multiplier to power gain (+10% per day, capped at +50%). Resets if 2+ days are missed in a row.

---

## Workout Terminology

### Combat Training
CrossFit-style WOD (Workout of the Day) sessions. Split into Upper Focus (Monday) and Lower Focus (Thursday). Includes strength block, conditioning block, and a finisher.

### Gravity Training
Running sessions. Named after the gravity training chambers in DBZ. Three types rotate through the week: Intervals (Tuesday), Tempo (Wednesday), Long Run (Saturday).

### Turtle School Method
Calisthenics skill day (Friday). Named after Master Roshi's Turtle School. Focuses on handstand, L-sit, front lever, and planche progressions. Lower intensity — functions as a recovery-adjacent day.

### Hyperbolic Rest
Full rest day (Sunday). Named after the Hyperbolic Time Chamber. No training prescribed.

---

## Workout Phases

Every structured workout follows these phases:

### Power Up Phase
Warmup. Dynamic mobility, joint prep, and 2–3 primer sets at low intensity. Duration: 8–12 minutes for CrossFit, 5–8 minutes for running.

### Full Power Combat — Strength Block
The main strength work in CrossFit sessions. One compound lift or gymnastic skill, 4–6 sets of 3–8 reps with 2–3 min rest. Strength-focused, not conditioning.

### Full Power Combat — Conditioning Block
The metabolic conditioning portion of CrossFit sessions. AMRAP or rounds-for-time format, 3–4 movements per round, 10–20 minutes. Mix of pushing, pulling, legs, and core.

### Final Strike
Short, brutal finisher. 3–5 minutes max. Single movement or two movements alternating at high intensity. Examples: max burpees in 3 min, tabata push-ups, 100 squats for time.

### Ki Recovery
Cooldown. Static stretching targeting worked muscles plus breathwork (4-7-8 breathing or box breathing). Duration: 5–8 minutes.

---

## Training Blocks

The 12-week program is divided into three 4-week blocks:

### Block 1 — Saiyan Arc (Weeks 1–4)
Base building phase. Establish movement patterns, build aerobic base, refine technique. Moderate intensity with no maximal efforts.

### Block 2 — Namek Arc (Weeks 5–8)
Intensity build phase. Heavier loads, faster intervals, harder calisthenics progressions. Push comfort zones.

### Block 3 — Cell Games Arc (Weeks 9–12)
Peak performance phase. Maximum intensity, benchmark testing, retest 5km time, hit skill milestones.

---

## Running Terms

### Intervals
High-intensity run session with alternating hard effort and easy jog recovery. Rounds and rest periods progress across blocks (Block 1: 6×60s/90s → Block 3: 10×75s/60s).

### Tempo Run
Sustained effort at "comfortably hard" pace — can speak in broken sentences, not full conversation, not sprinting. Duration progresses from 20 min (Block 1) to 30 min (Block 3).

### Long Run
Easy conversational pace, Zone 2 effort. Should feel almost too easy. Aerobic base building, not performance. Distance progresses from 6–7km (Block 1) to 9–11km (Block 3).

### Zone 2
Heart rate training zone where you can maintain a conversation. Roughly 60–70% of max heart rate. Used for aerobic base building on long run days.

---

## Calisthenics Progressions

### Handstand Progression
Wall handstand hold → Kick-up practice → Chest-to-wall hold → Freestanding kick-ups → Freestanding handstand

### L-Sit Progression
Floor L-sit attempts → Parallel bar L-sit → Full L-sit → L-sit to tuck → Straddle L-sit

### Front Lever Progression
Tuck front lever hold → Advanced tuck front lever → Straddle front lever

### Planche Progression
Planche lean hold → Tuck planche → Advanced tuck planche

---

## CrossFit / Strength Terms

### WOD
Workout of the Day. The prescribed training session for a given day.

### AMRAP
As Many Rounds As Possible. A conditioning format where you complete as many rounds of prescribed movements as you can within a time cap.

### Rounds for Time
A conditioning format where you complete a set number of rounds as fast as possible.

### Compound Lift
Multi-joint barbell or dumbbell movement that works multiple muscle groups. Examples: squat, deadlift, bench press, push press.

### Olympic Lifts
Explosive barbell movements derived from Olympic weightlifting: clean, snatch, jerk, and their variations.

### Tabata
Interval protocol: 20 seconds max effort, 10 seconds rest, repeated for 8 rounds (4 minutes total).

---

## API Call Types

### Weekly Generation
AI call that produces a full week of workouts based on athlete profile, current block/week, recent logs, and exercise history.

### Weekly Debrief
AI call that produces a coaching summary in Master Roshi's voice, referencing specific numbers from the week's logs. Includes a power level change recommendation.

### Schedule Rotation
AI call that restructures the weekly schedule when triggered by boredom, plateau, injury, or manual request.

### Mid-Week Recalibration
AI call that rescales remaining workouts when sessions are missed mid-week. Adjusts intensity and volume without judgment.

---

## Technical Terms

### PWA (Progressive Web App)
A web application that can be installed on a device's home screen and work offline. Saiyan Protocol uses a service worker and web manifest for PWA support.

### Service Worker
A background script that intercepts network requests and enables offline caching. The app uses a network-first strategy with precached static assets.

### Scouter HUD
The visual design language of the app, inspired by the Scouter device from Dragon Ball Z. Features scanlines, crosshairs, sweep animations, and power level readouts.

### Pluggable AI Provider
The backend AI service is designed to work with multiple LLM providers (OpenAI, Anthropic, Gemini) through a common interface. Currently a stub awaiting real provider integration.
