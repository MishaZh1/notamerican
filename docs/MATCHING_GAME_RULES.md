# Matching Game - Critical Implementation Rules

This document outlines the strict rules that must be followed to prevent bugs in the Matching Game logic.

## 1. Selection Logic (The "Selection Bug")
**Rule**: The game **MUST NOT** allow a user to select more than 2 cards at any time.
**Implementation**:
The state reducer must explicitly block any `SELECT_CARD` action if 2 cards are already selected.
```typescript
// IN REDUCER:
if (state.selectedCards.length >= 2) {
    return state; // REJECT SELECTION
}
```
**Why**: This prevents the "3rd card selected" glitch where a user could select multiple cards while others are processing, breaking the matching logic.

## 2. Card Replacement (The "Unbalanced Bug")
**Rule**: When replacing a matched pair, the new cards **MUST** be placed one in the Left Column (Positions 0-4) and one in the Right Column (Positions 5-9).
**Implementation**:
```typescript
// NEVER random across 0-9.
// ALWAYS:
const newLeft = random(availableLeftPositions); // 0-4
const newRight = random(availableRightPositions); // 5-9
```
**Why**: This guarantees the grid remains perfectly balanced (5 vs 5) forever.

## 3. Atomic Updates
**Rule**: Card states must update atomically. Both cards in a pair must transition (e.g., to MATCHED or WRONG) in the same frame.
