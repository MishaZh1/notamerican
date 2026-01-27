# MatchingGame.tsx Refactoring Plan

## Current Status
- **File:** `src/components/game/MatchingGame.tsx`
- **Lines:** 816
- **Status:** ❌ Too large, needs refactoring

## Completed Steps ✅

1. ✅ Created folder structure: `src/components/game/matching/`
2. ✅ Extracted types → `types.ts`
3. ✅ Extracted constants → `utils/constants.ts`
4. ✅ Extracted animations → `utils/cardAnimations.ts`
5. ✅ Extracted position utilities → `utils/positionManager.ts`

## Remaining Work 🚧

### Phase 1: Extract Game Logic (4-6 hours)

**1. Create `hooks/useGameState.ts`** (200 lines)
- Move `gameReducer` function
- Export `useGameState` hook
- Handle all state transitions

**2. Create `hooks/useCardReplacement.ts`** (150 lines)
- Extract `handleReplacement` logic
- Manage position pools (freeLeftPoolRef, freeRightPoolRef)
- Handle staggered cross-matching

**3. Create `hooks/useMatchDetection.ts`** (100 lines)
- Extract match detection logic from useEffect
- Handle correct/wrong match callbacks
- Manage timing for animations

### Phase 2: Extract UI Components (2-3 hours)

**4. Create `components/GameHeader.tsx`** (80 lines)
- Score display
- Combo indicator
- Timer
- Progress bar

**5. Create `components/Card.tsx`** (100 lines)
- Individual card component
- Handle click events
- Apply animations from `cardAnimations.ts`

**6. Create `components/GameBoard.tsx`** (120 lines)
- Left/right column layout
- Card grid rendering
- AnimatePresence wrapper

### Phase 3: Refactor Main Component (1-2 hours)

**7. Update `MatchingGame.tsx`** (150 lines)
- Import all hooks and components
- Orchestrate game flow
- Handle props and callbacks
- Much cleaner, easier to read

## Expected Result

```
matching/
├── MatchingGame.tsx (150 lines) ← Main orchestrator
├── types.ts (70 lines) ✅ DONE
├── hooks/
│   ├── useGameState.ts (200 lines)
│   ├── useCardReplacement.ts (150 lines)
│   └── useMatchDetection.ts (100 lines)
├── components/
│   ├── GameHeader.tsx (80 lines)
│   ├── Card.tsx (100 lines)
│   └── GameBoard.tsx (120 lines)
└── utils/
    ├── constants.ts (20 lines) ✅ DONE
    ├── cardAnimations.ts (50 lines) ✅ DONE
    └── positionManager.ts (50 lines) ✅ DONE
```

**Total:** ~1,090 lines across 11 files (vs. 816 lines in 1 file)

## Benefits

✅ Each file <200 lines (maintainable)
✅ Easy to test individual pieces
✅ Reusable hooks for other game modes
✅ Clear separation of concerns
✅ Better code navigation
✅ Easier onboarding for new developers

## Next Steps

**Option A: Complete refactoring now** (7-11 hours total)
- Full implementation
- Test thoroughly
- Update imports in parent components

**Option B: Incremental refactoring** (1-2 hours per phase)
- Do Phase 1 this week
- Phase 2 next week
- Phase 3 final week

**Option C: Pause and prioritize SVG optimization**
- Immediate performance impact
- Come back to refactoring later

## Recommendation

I recommend **Option C** for now:
1. ✅ Complete SVG optimization (30 min, immediate impact)
2. ⏸️ Pause refactoring (can resume anytime)
3. 🎮 Focus on new features/games

The groundwork is done (types, constants, animations extracted). The remaining refactoring can be done incrementally when you have time, or when the file becomes too hard to work with.

---

**Status:** Foundation complete, ready for Phase 1 when needed
