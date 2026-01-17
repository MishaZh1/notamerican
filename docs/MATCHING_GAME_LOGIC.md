## Overview

The matching game presents pairs of related items (e.g., country ↔ capital) that users must match. When matched correctly, cards remain visible for 4 seconds before being replaced with new pairs. The game supports multiple simultaneous matches with intelligent positioning logic.

> [!WARNING]
> **CRITICAL IMPLEMENTATION RULES (HOW NOT TO DO IT)**
> 1. **NEVER** assign two new cards to the same column. One must ALWAYS be in the Left Column (0-4) and one in the Right Column (5-9). Randomizing positions across the entire grid without column constraints causes layout breakage (e.g., 7 cards on left, 3 on right).
> 2. **NEVER** allow selecting more than 2 cards. The reducer/state machine must strictly reject selection attempts if `selectedCards.length >= 2`.
> 3. **NEVER** allow selecting cards that are in `WRONG` or `MATCHED` states.


## Game Configuration

### Grid Layout
- **Total Cards**: 10 cards
- **Grid Structure**: 2 rows × 5 columns
- **Pairs**: 5 pairs (each pair consists of 2 related cards)
- **Card Positions**: Numbered 0-9 (or 1-10 depending on implementation)

```
[0] [1] [2] [3] [4]
[5] [6] [7] [8] [9]
```

### Content Structure
Each card contains:
- **Type A Card**: Primary item (e.g., "🇫🇷 France")
- **Type B Card**: Related item (e.g., "Paris")
- **Pair ID**: Unique identifier linking the two cards

## State Management

### Card States

| State | Description | Duration | User Interaction |
|-------|-------------|----------|------------------|
| `IDLE` | Unmatched, clickable card | Indefinite | Clickable |
| `SELECTED` | First card clicked, waiting for pair | Until second click | Not clickable |
| `MATCHED` | Correct pair matched | 4 seconds | Not clickable |
| `WRONG` | Incorrect pair selected | ~500ms animation | Not clickable |
| `DISAPPEARING` | Matched cards fading out | ~300ms | Not clickable |
| `APPEARING` | New cards fading in | ~300ms | Not clickable |

### Game State

```typescript
interface GameState {
  cards: Card[];                    // Array of 10 cards
  selectedCards: number[];          // Indices of selected cards (max 2)
  matchedPairs: MatchedPair[];      // Pairs waiting to disappear
  totalMatches: number;             // Total successful matches
  occupiedPositions: Set<number>;   // Positions with cards waiting to disappear
}

interface Card {
  id: string;                       // Unique card ID
  pairId: string;                   // ID linking to matching card
  content: string;                  // Display content
  type: 'A' | 'B';                  // Card type in pair
  position: number;                 // Grid position (0-9)
  state: CardState;                 // Current state
}

interface MatchedPair {
  cardIndices: [number, number];    // Positions of matched cards
  matchedAt: number;                // Timestamp when matched
  timerId: NodeJS.Timeout;          // Timer for 4-second delay
}
```

## Core Game Flow

### 1. Initialization

```
1. Generate 5 random pairs from content pool
2. Shuffle all 10 cards
3. Assign positions 0-9 to cards
4. Set all cards to IDLE state
5. Initialize totalMatches = 0
6. Initialize empty matchedPairs array
```

### 2. Card Selection

**When user clicks a card:**

```
IF card.state !== IDLE:
  RETURN (ignore click)

IF selectedCards.length === 0:
  SET card.state = SELECTED
  ADD card index to selectedCards
  RETURN

IF selectedCards.length === 1:
  SET card.state = SELECTED
  ADD card index to selectedCards
  CALL checkMatch()
```

### 3. Match Validation

**checkMatch() logic:**

```
GET card1 = cards[selectedCards[0]]
GET card2 = cards[selectedCards[1]]

IF card1.pairId === card2.pairId:
  CALL handleCorrectMatch(card1, card2)
ELSE:
  CALL handleWrongMatch(card1, card2)

CLEAR selectedCards array
```

### 4. Correct Match Handling

**handleCorrectMatch(card1, card2):**

```
1. SET card1.state = MATCHED
2. SET card2.state = MATCHED
3. INCREMENT totalMatches
4. ADD card1.position to occupiedPositions
5. ADD card2.position to occupiedPositions

6. CREATE timer = setTimeout(() => {
     CALL replaceMatchedPair(card1.position, card2.position)
   }, 4000)

7. ADD to matchedPairs:
   {
     cardIndices: [card1.position, card2.position],
     matchedAt: Date.now(),
     timerId: timer
   }
```

### 5. Wrong Match Handling

**handleWrongMatch(card1, card2):**

```
1. SET card1.state = WRONG
2. SET card2.state = WRONG
3. PLAY wrong animation (~500ms)
4. SET card1.state = IDLE
5. SET card2.state = IDLE
```

### 6. Card Replacement Logic

**replaceMatchedPair(position1, position2):**

This is the critical logic that determines where new cards appear.

```
1. REMOVE position1 from occupiedPositions
2. REMOVE position2 from occupiedPositions
3. REMOVE this pair from matchedPairs array

4. DETERMINE new positions:
   
   IF occupiedPositions.size > 0:
     // Multiple matches are waiting - use RANDOM positions
     availablePositions = [0,1,2,3,4,5,6,7,8,9] - occupiedPositions
     newPosition1 = RANDOM from availablePositions
     REMOVE newPosition1 from availablePositions
     newPosition2 = RANDOM from availablePositions
   
   ELSE:
     // Only this match - use SAME positions
     newPosition1 = position1
     newPosition2 = position2

5. SET cards[position1].state = DISAPPEARING
6. SET cards[position2].state = DISAPPEARING

7. AFTER 300ms:
   GENERATE new pair from content pool (excluding current pairs)
   CREATE newCard1 at newPosition1
   CREATE newCard2 at newPosition2
   SET newCard1.state = APPEARING
   SET newCard2.state = APPEARING
   
8. AFTER 300ms:
   SET newCard1.state = IDLE
   SET newCard2.state = IDLE
```

## Positioning Algorithm

### Random Position Selection

```typescript
function getRandomPositions(occupiedPositions: Set<number>): [number, number] {
  const allPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const available = allPositions.filter(pos => !occupiedPositions.has(pos));
  
  // Shuffle available positions
  const shuffled = available.sort(() => Math.random() - 0.5);
  
  return [shuffled[0], shuffled[1]];
}
```

### Position Reuse Logic

```typescript
function shouldReusePositions(occupiedPositions: Set<number>): boolean {
  // If no other cards are waiting to disappear, reuse same positions
  return occupiedPositions.size === 0;
}
```

## Edge Cases & Scenarios

### Scenario 1: Single Match
```
User matches cards at positions 2 and 7
→ Wait 4 seconds
→ No other matches made
→ Replace at positions 2 and 7 (SAME)
```

### Scenario 2: Two Quick Matches
```
T=0s: Match at positions 1,6 (Timer A starts)
T=2s: Match at positions 3,8 (Timer B starts)

T=4s: Timer A expires
      → occupiedPositions = {3,8} (from Timer B)
      → Replace 1,6 with random positions (e.g., 0,9)

T=6s: Timer B expires
      → occupiedPositions = {} (empty)
      → Replace 3,8 at positions 3,8 (SAME)
```

### Scenario 3: All Five Pairs Matched Simultaneously
```
T=0s: All 5 pairs matched (10 cards, positions 0-9)

T=4s: First pair timer expires
      → occupiedPositions = {0,1,2,3,4,5,6,7,8,9} - {first pair positions}
      → Replace first pair at random available positions

T=4s + δ: Second pair timer expires
      → occupiedPositions updated
      → Replace second pair at random available positions

... and so on for remaining pairs
```

### Scenario 4: Rapid Sequential Matching
```
User matches all 5 pairs within 1 second:
→ 5 timers running simultaneously
→ Each timer expires at 4s, 4.1s, 4.2s, 4.3s, 4.4s
→ Each replacement checks occupiedPositions at its expiration time
→ Positions are dynamically allocated based on what's still occupied
```

## Performance Considerations

### Timer Management
- Each matched pair creates ONE timer
- Timers are stored in `matchedPairs` array
- Timers are cleared when pairs are replaced
- Maximum simultaneous timers: 5 (if all pairs matched at once)

### State Updates
- Use immutable state updates for React/Vue compatibility
- Batch position updates when possible
- Debounce rapid clicks to prevent double-selection

### Memory Management
- Clean up timers on component unmount
- Remove completed pairs from `matchedPairs` array
- Clear `occupiedPositions` set as positions become available

## Content Pool Management

### Requirements
- Content pool must have enough pairs to avoid repetition
- Minimum recommended pool size: 20+ pairs
- Track recently used pairs to ensure variety

### Pair Generation
```typescript
function generateNewPair(
  usedPairIds: Set<string>,
  contentPool: Pair[]
): Pair {
  const available = contentPool.filter(p => !usedPairIds.has(p.id));
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}
```

## Accessibility Considerations

- **Keyboard Navigation**: Support Tab/Enter for card selection
- **Screen Readers**: Announce match results and card content
- **Focus Management**: Maintain focus on interactive elements
- **Color Contrast**: Don't rely solely on color for state indication

## Testing Scenarios

1. **Single match, no other activity** → Same position replacement
2. **Two matches within 4 seconds** → Random position replacement
3. **All five pairs matched rapidly** → All random replacements
4. **Match during replacement animation** → Queue properly
5. **Rapid clicking same card** → Ignore duplicate clicks
6. **Click matched card** → Ignore click
7. **Component unmount with active timers** → Clean up all timers

## Implementation Checklist

- [ ] Set up state management (useReducer recommended)
- [ ] Implement card selection logic
- [ ] Implement match validation
- [ ] Implement 4-second timer system
- [ ] Implement position tracking (occupiedPositions)
- [ ] Implement random position algorithm
- [ ] Implement card replacement logic
- [ ] Add animations (matched, wrong, disappearing, appearing)
- [ ] Add sound effects (optional)
- [ ] Implement cleanup on unmount
- [ ] Add keyboard accessibility
- [ ] Test all edge cases

---

**Version**: 1.0  
**Last Updated**: 2026-01-16  
**Author**: NotAmerican Development Team
