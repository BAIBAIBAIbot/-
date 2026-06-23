# Dog Butterfly Game Design

Date: 2026-06-23

## Goal

Build a small browser game for learning a complete beginner-friendly development flow. The game should feel like a cozy, detailed pixel-art meadow: a cute dog catches butterflies after the player clicks them, and the player tries to score as many catches as possible within 30 seconds.

## Selected Direction

The selected visual direction is Bright Meadow:

- Sunny grassland with clear blue sky, flowers, fence details, and warm pixel-art colors.
- The dog and butterflies must stay easy to recognize during gameplay.
- The first playable version will use code-drawn pixel-style art. More polished sprite or image assets can replace those later.

## Gameplay

The player starts from a simple start screen. During the 30-second round, butterflies appear in the play area and drift gently. The player clicks a butterfly to mark it as the current target. The dog automatically runs toward the target. When the dog reaches the target, the butterfly is caught, the score increases, and a new butterfly appears.

When time reaches zero, the game stops and shows the final score with a restart button.

## Controls

- Mouse click or touch tap on a butterfly: select it as the target for the dog.
- Start button: begin a new 30-second round.
- Restart button: reset the score, timer, dog, and butterflies.

## Technical Approach

Use a plain web app with no build step:

- `index.html` for the page structure.
- `styles.css` for layout, buttons, and page-level styling.
- `script.js` for game state, drawing, input, animation, scoring, and reset logic.

Use one HTML `canvas` as the main game surface. Canvas is the best fit for moving sprites, simple collision checks, animation, and pixel-style rendering without introducing a framework.

## Game State

The game will track:

- `state`: start, playing, or ended.
- `score`: number of butterflies caught.
- `timeLeft`: seconds remaining in the current round.
- `dog`: position, speed, facing direction, and current target.
- `butterflies`: active butterfly objects with position, color, drift, size, and caught state.
- `lastFrameTime`: timestamp used for smooth movement.

## Drawing

The canvas draw loop will render in this order:

1. Sky, distant hills, meadow, fence, flowers, and decorative grass.
2. Butterflies with wing flaps and clear colored silhouettes.
3. Dog with a readable pixel-style body, ears, legs, tail, and running pose.
4. Click or catch effects, such as small sparkles.
5. HUD text for score and time.
6. Start or game-over overlay when needed.

The visual design should stay detailed but not obscure gameplay targets.

## Movement And Scoring

Butterflies move with gentle drifting motion inside the play area. The dog stays near the lower part of the field and moves toward the selected butterfly at a fixed speed. A catch happens when the distance between the dog and target butterfly is below a small threshold.

On catch:

- Increase score by 1.
- Remove the caught butterfly.
- Spawn a replacement butterfly at a safe random location.
- Clear the current target.
- Show a short catch effect.

## Error Handling And Edge Cases

- Clicks outside butterflies do not change the target.
- If the selected target disappears, the dog stops chasing until another butterfly is clicked.
- Butterflies are spawned inside safe bounds so they do not appear under the HUD or outside the visible canvas.
- The game handles browser resize by keeping the canvas visually responsive while preserving the internal game coordinate system.
- Restart always resets score, timer, dog position, target, butterflies, and effects.

## Testing Plan

Manual verification for the first version:

- Open `index.html` in a browser and confirm the start screen appears.
- Start the game and confirm the 30-second timer counts down.
- Click a butterfly and confirm the dog moves toward it.
- Confirm a catch increases the score by 1.
- Confirm new butterflies appear after catches.
- Confirm time reaching zero shows the final score and restart control.
- Restart and confirm the game resets cleanly.
- Try a smaller browser window and confirm the canvas remains usable.

## Out Of Scope For Version 1

- Sound effects or music.
- Saved high scores.
- Multiple levels or difficulty modes.
- Final production sprite sheets.
- Mobile-specific gesture tuning beyond basic touch support.

These are good follow-up improvements after the first playable version works.
