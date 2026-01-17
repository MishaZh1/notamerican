# Matching Game Logic Specification

This document defines the exact behavior for the "Matching Game" (Match Madness) mode, replicating the smooth, glitch-free mechanics of [PairLearner.app](https://pairlearner.app).

## 1. Core Visual Concept: "The Static Grid"
- **Layout**: 2 Fixed Columns (Left & Right).
- **Rows**: 5 Fixed Rows.
- **Behavior**: Cards **never** change positions. They do not slide, shift, or jump.
  - *Why?* This prevents clicking errors and visual confusion.
- **Refill**: When a correct match is made, the two specific cards fade out and are replaced by new cards *in the exact same slots*.

## 2. Interaction Rules (The "Input Lock")

### A. Selection State
1.  **Idle**: No cards selected. User can click any card.
2.  **One Selected**: User clicks Card A.
    - Card A turns **Blue** (Selected).
    - **Same Column Switch**: If user clicks Card B (same column as A), Card A deselects, and Card B becomes Selected. *You can never have 2 cards selected in the same column.*
    - **Cross Column Match**: If user clicks Card C (opposite column), we proceed to **Evaluation**.

### B. Evaluation State (Locked)
**CRITICAL**: Once the 2nd card is clicked, the game enters a **LOCKED** state.
- **Input Block**: The user **CANNOT** click any other cards. All taps are ignored.
- This prevents the "Multiple Red Cards" bug seen in screenshots.

#### Scenario 1: Correct Match
1.  **Visual**: Both cards turn **Green** + Sparkle Icon appears.
2.  **Logic**:
    - Score increments.
    - Time Bonus (optional).
    - Combo increments.
3.  **Transition**:
    - Wait 200-400ms (Validation Delay).
    - Cards fade out (opacity 0).
    - **Refill**: New data is assigned to these 2 specific slots.
    - Cards fade in (opacity 1).
    - **Input Unlock**: Game accepts clicks again.

#### Scenario 2: Wrong Match
1.  **Visual**: Both cards turn **Red** + Shake Animation.
2.  **Logic**:
    - Combo resets to 0.
    - Time Penalty (optional).
3.  **Transition**:
    - Wait 500ms (Error Display).
    - **Reset**: Both cards return to **White/Idle**.
    - **Input Unlock**: Game accepts clicks again.

## 3. Data Model
Each "Slot" in the grid is persistent.
```typescript
interface GridSlot {
  slotId: number; // 0-4 for Left, 5-9 for Right
  currentCard: {
    id: string;
    content: string;
    pairId: string;
    status: 'IDLE' | 'SELECTED' | 'MATCHED' | 'WRONG';
  }
}
```

## 4. Edge Cases Checklist
- [ ] **Rapid Tapping**: If I tap 5 cards instantly, only the first 2 register. The rest are ignored until the result animation finishes.
- [ ] **Same Column**: Clicking standard -> standard (Left -> Left) just switches selection.
- [ ] **Double Tap**: Clicking the *same* card twice should deselect it (toggle off).

## 5. Visual Feedback Palette
- **Idle**: White Shadow Card (`bg-white border-b-4 border-slate-200`)
- **Selected**: Blue (`bg-cyan-100 border-cyan-500`)
- **Correct**: Green (`bg-green-100 border-green-500`) + Sparkles
- **Wrong**: Red (`bg-red-100 border-red-500`) + Shake

This logic ensures a robust, glitch-free experience identical to high-quality apps like Duolingo or PairLearner.

## 6. Technical Implementation Details
### Input Locking (State Machine)
To guarantee the "Locked" state, we use an `isProcessing` flag in the game reducer.
- **True**: During `MATCH_CORRECT`, `MATCH_WRONG`, or `REPLACE_CARDS` animations.
- **False**: Only set to false via explicitly dispatched `unlock` actions *after* animations complete.
- **Impact**: Any `SELECT_CARD` action is ignored if `isProcessing` is true.

### Completion Callback
The `MatchingGame` component communicates results via a typed object to prevent runtime errors in parent components.

```typescript
export interface GameStats {
    score: number;
    matches: number;
    combo: number;
    maxCombo: number;
}
```
This ensures that the `Flags` and `Match` pages receive consistent data structure, preventing `undefined.toString()` crashes.
