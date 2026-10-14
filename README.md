# MEMENTO ENGINE — Cognitive Simulation

**Release:** 1.0.0 · **License:** MIT

A small, playable browser game about guiding an autonomous character by editing the emotional associations attached to their memories. You cannot issue direct movement or dialogue commands; you alter the character's internal model and watch the decision engine choose an action.

## Play locally

1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. Click **Initialize Cognitive Link**.

The game uses vanilla HTML, CSS, and JavaScript. No installation, API key, game server, database, or paid AI service is required. It can run offline after the files have been downloaded. The interface uses system font fallbacks and no image assets.

## Publish on GitHub Pages

1. Create a new GitHub repository (for example, `memento-engine`).
2. Upload `index.html`, `styles.css`, `game.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Once the Pages deployment finishes, open the URL shown in the Pages settings.

This is a static site, so GitHub Pages is sufficient. No build step is needed.

## Controls

- **Select a memory fragment** in the Memory Lab.
- Select one of its association rows (fear, bravery, curiosity, trust, caution, or attachment).
- Use **Dampen** or **Amplify** to adjust the weight by 13 points. Each action spends one intervention signal.
- Use **Reframe Association** to swap a trait with its opposite. It costs two signals and increases cognitive load.
- Press **Run Next Thought** to let the autonomous utility model choose its highest-scoring action.
- Watch the internal monologue, action utility, environment, and black-box transcript change.

The run moves through four sectors: The Red Corridor, The Flooded Atrium, The Medical Bay, and The Memory Core. Decisions, integrity, cognitive load, recovered fragments, and the final ending depend on the current game state and memory associations.

## Save data

The game autosaves to this browser's `localStorage`. The **Restart** button starts a fresh instance after confirmation. Clearing site data also clears the saved run.

## Technical notes

- `game.js` contains the room definitions, memory graph, trait inference, utility scoring, consequences, persistence, and ending logic.
- The environment is drawn on a canvas with procedural geometry, lighting, particles, and room-specific effects. It has no external art dependencies.
- The decision system is local, deterministic with respect to current state, and rule/utility-based. It is AI-inspired simulation logic, not a call to a remote large language model. Non-progress actions lose utility when repeated, so a character can pause without getting stuck in a permanent loop.
- All of the game's displayed story text is authored for this project; the character's actions and resulting state changes are computed at runtime.

## Project files

- `index.html` — game interface and intro/ending screens
- `styles.css` — responsive visual design and animations
- `game.js` — simulation engine and canvas rendering
- `README.md` — setup and hosting guide
- `LICENSE` — MIT license
