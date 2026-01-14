# Directive: Generate Trivia Questions

## Goal
Generate high-quality, non-US-centric trivia questions for the NotAmerican platform.

## Input
- `category`: The topic of the trivia (e.g., "World History", "Global Cuisines").
- `difficulty`: Level from 1 (easy) to 5 (expert).
- `count`: Number of questions to generate (default: 10).

## Execution
Run the following script:
```bash
python3 execution/generate_trivia.py --category "[CATEGORY]" --difficulty [DIFFICULTY] --count [COUNT] --output .tmp/trivia_[CATEGORY].json
```

## Output
- A JSON file in `.tmp/` containing an array of question objects.
- Each object includes `question_text`, `answers`, `correct_index`, and `explanation`.

## Edge Cases & Learning
- If the API fails, check the `.env` for a valid `OPENAI_API_KEY`.
- If questions are too US-centric, refine the category name or manual prompt.
- The `explanation` should be concise (under 100 characters).
