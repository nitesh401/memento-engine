<div align="center">

# MEMENTO ENGINE
### A Cognitive Survival Experiment

**You can't tell the person what to do. You can only change what their memories mean.**

[![Version](https://img.shields.io/badge/version-1.0.0-8b7cff?style=for-the-badge)](#)
[![Platform](https://img.shields.io/badge/platform-GitHub%20Pages-171923?style=for-the-badge)](#https://nitesh401.github.io/memento-engine/)
[![License: MIT](https://img.shields.io/badge/license-MIT-51d6b2?style=for-the-badge)](LICENSE)
[![AI Model](https://img.shields.io/badge/AI-local%20utility%20model-e8a2ff?style=for-the-badge)](#how-the-ai-works)

*A self-contained, single-player browser game built with HTML, CSS, and JavaScript. No build step, account, server, API key, or paid AI service required.*

</div>

---

## The premise

Elian Voss is trapped inside a failing habitat. He has memories, fears, needs, and incomplete beliefs about the world—but you cannot control his movement or choose his next action directly.

You are the cognitive system observing him. Your intervention is memory itself: strengthen an association, weaken it, or reframe it as its opposite. Then let Elian make his own decision and live with the consequences.

A memory that helps him in one situation may put him in danger in the next. The goal is not simply to keep him alive; it is to discover what kind of person he becomes by the time he reaches the Memory Core.

## What makes it different?

- **Memory is the control scheme.** You change the emotional associations attached to memories instead of issuing direct commands.
- **The character chooses autonomously.** A local utility-scoring model ranks available actions using inferred traits, current needs, and environmental context.
- **Interventions have a cost.** Signals are limited, and reframing an association increases cognitive load.
- **The environment reacts.** Each sector has its own setting, risks, available actions, and consequences.
- **The outcome reflects the run.** Decisions, edits, recovered fragments, integrity, and cognitive load contribute to the ending.
- **The interface is part of the fiction.** An animated canvas, perception overlays, inferred-disposition meters, and a black-box transcript let you inspect the simulation as it unfolds.

## The gameplay loop

1. **Inspect** a memory fragment and review its association weights.
2. **Intervene** by dampening, amplifying, or reframing an association.
3. **Predict** by reviewing the candidate actions and their displayed utility scores.
4. **Run the next thought.** Elian selects an action through the decision model; you do not pick the action for him.
5. **Observe the consequences** in the environment, status meters, internal monologue, and transcript.
6. **Continue through four sectors** and discover which outcome your interventions have shaped.

## Journey through the habitat

| Sector | Environment | What to consider |
| --- | --- | --- |
| **01 — The Red Corridor** | Emergency lighting; compromised access route | Fear, caution, and the urge to wait for a signal |
| **02 — The Flooded Atrium** | Rising water; partially active power grid | Risk, curiosity, resources, and whether to trust a voice |
| **03 — The Medical Bay** | Automated triage; corrupted records | Recovery, attachment, and the value of incomplete evidence |
| **04 — The Memory Core** | Central intelligence; failing identity boundary | Confrontation, severance, or accepting a damaged memory |

## Play locally

No installation or build tooling is needed.

1. Download or clone this repository.
2. Keep `index.html`, `styles.css`, and `game.js` together in the same directory.
3. Open `index.html` in a modern browser.
4. Select **Initialize Cognitive Link**. If a saved run exists in that browser, the game can offer to continue it.

The game uses vanilla JavaScript and the browser Canvas API. It has no external runtime dependencies or external image assets, so it can run offline once the files are on your device.

## Publish on GitHub Pages

If the repository is already on GitHub, you only need to enable Pages for the branch containing these files.

1. Open the repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose the `main` branch and `/(root)` as the folder, then save.
4. Wait for the deployment to finish and open the published URL shown in the Pages settings.

Keep the following files in the repository root for the instructions above to work:

```text
.
├── index.html
├── styles.css
├── game.js
├── README.md
└── LICENSE
```

No framework build or GitHub Actions workflow is required for this static version.

## Controls and mechanics

| Control | Effect | Cost |
| --- | --- | --- |
| Select a memory fragment | Inspect a memory and its emotional associations | Free |
| Select an association row | Choose which trait association to edit | Free |
| **Dampen** | Reduce the selected association weight | 1 intervention signal |
| **Amplify** | Increase the selected association weight | 1 intervention signal |
| **Reframe Association** | Swap an association with its opposite (for example, fear ↔ bravery) | 2 intervention signals; increases cognitive load |
| **Run Next Thought** | Let the decision model choose the highest-scoring available action | Advances the simulation |
| **Restart** | Start a new run after confirmation | Replaces the current run in this browser |

Association weights are bounded, and an intervention does not guarantee a particular action. The same change can have different effects depending on the sector and the other traits currently influencing the decision.

## How the AI works

MEMENTO ENGINE uses a **local, rule- and utility-based decision simulation**. For each available action, the game computes a score using the subject's inferred disposition and the current simulation state. It then selects the highest-scoring option and applies the corresponding consequences.

This is not a remote large language model, and the project does not claim to train a machine-learning model. The AI-inspired behavior is implemented directly in `game.js`, making it free to run, inspectable, and usable without an internet connection after download.

## Save data and privacy

- The current run is autosaved to the browser's `localStorage`.
- Save data stays in that browser profile on that device; it is not synced between devices.
- Clearing the site's browser storage removes the saved run.
- The game does not need an account, API key, or backend to play.

## Built with

- **HTML5** — interface and semantic structure
- **CSS3** — responsive layout, atmosphere, and animation
- **Vanilla JavaScript** — game state, memories, rules, and decision scoring
- **Canvas API** — procedural environment rendering and visual effects
- **localStorage** — local save and resume

## Project structure

| File | Responsibility |
| --- | --- |
| `index.html` | Game interface, intro screen, and ending screen |
| `styles.css` | Layout, responsive styling, atmosphere, and animations |
| `game.js` | Memory graph, room definitions, trait inference, utility scoring, consequences, rendering, and persistence |
| `README.md` | Project overview, controls, and hosting instructions |
| `LICENSE` | MIT license |

## Scope of version 1.0.0

This release is a compact, single-player concept game designed to demonstrate the core memory-intervention mechanic. It is client-side only: there is no multiplayer, backend service, or generative-AI integration. The decision system and narrative events are authored rules evaluated at runtime.

## License

Released under the [MIT License](LICENSE). You may use, modify, and distribute this project in accordance with the license terms.

---

<div align="center">

**MEMENTO ENGINE** · *Memory is not the same as truth.*

</div>
