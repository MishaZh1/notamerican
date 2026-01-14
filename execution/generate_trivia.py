import os
import json
import argparse
from typing import List, Dict
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_trivia(category: str, difficulty: int, count: int = 10) -> List[Dict]:
    """
    Generates trivia questions using the OpenAI API.
    """
    prompt = f"""
Generate {count} trivia questions for the category {category} at difficulty level {difficulty}.
Return ONLY a JSON array with the following schema:
```json
[
  {{
    "category": "string",
    "difficulty": number,
    "question_text": "string",
    "answers": ["string", "string", "string", "string"],
    "correct_index": number,
    "explanation": "string (max 100 chars)"
  }}
]
```
Ensure the "NotAmerican" flavor: focus on interesting facts from various cultures, avoid US-centric bias unless the category specifically calls for it.
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert Quizmaster for 'NotAmerican', a general knowledge platform that avoids US-centric bias."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    # Depending on the output, we might need to strip markdown backticks
    if content.startswith("```json"):
        content = content[7:-3].strip()
    
    data = json.loads(content)
    # The response_format might return an object with a key, 
    # but the prompt asks for a JSON array. Let's be safe.
    if isinstance(data, dict):
        for key in data:
            if isinstance(data[key], list):
                return data[key]
    return data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate trivia questions.")
    parser.add_argument("--category", type=str, required=True, help="Trivia category")
    parser.add_argument("--difficulty", type=int, default=3, help="Difficulty level (1-5)")
    parser.add_argument("--count", type=int, default=10, help="Number of questions")
    parser.add_argument("--output", type=str, help="Path to save output JSON")

    args = parser.parse_args()

    try:
        questions = generate_trivia(args.category, args.difficulty, args.count)
        
        if args.output:
            os.makedirs(os.path.dirname(args.output), exist_ok=True)
            with open(args.output, "w") as f:
                json.dump(questions, f, indent=2)
            print(f"Successfully generated {len(questions)} questions to {args.output}")
        else:
            print(json.dumps(questions, indent=2))
            
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
