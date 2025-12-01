#!/usr/bin/env python3
import urllib.request
import urllib.parse
import wikiquote
import time
import os
from datetime import datetime
import google.generativeai as genai
from typing import Dict, List

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(opener)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

MODELS_TO_TEST = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.5-pro-preview-05-06',
]

QUOTES_TO_FETCH = 50
BATCH_SIZE = 10

def is_valid_quote(quote: str) -> bool:
    if not quote or len(quote) < 20 or len(quote) > 300:
        return False
    if any(x in quote.lower() for x in ['http', 'www.', '.com', '.org']):
        return False
    return True

def validate_quotes_batch_with_model(model_name: str, quotes_batch: list) -> list:
    quotes_text = "\n".join([f"{i+1}. Quote: \"{q['quote']}\" - Author: {q['author']}" 
                             for i, q in enumerate(quotes_batch)])
    
    prompt = f"""Evaluate each quote for quality in a typing practice game.

{quotes_text}

For EACH quote, respond with ONLY its number followed by "yes" or "no".
A quote should be marked "no" if it has ANY of these issues:
- Contains context markers in square brackets like [after doing something], [to someone], [speaking about X], [on topic]
- Contains markup, wiki formatting, citations, or references
- Is not a complete thought (cut off mid-sentence)
- Has excessive punctuation (too many "...", special chars)
- Is a list of items, song lyrics with line breaks, or a description rather than a quote
- Is not interesting or meaningful for typing practice
- Is a dialog with multiple speakers (contains "Name:" or "Character:" patterns indicating multiple people talking)
- Cannot be understood in isolation without knowing the context or question being answered
- Is an answer to an unspoken question (starts with phrases like "On a...", "When I...", "Because..." that imply a preceding question)

Example response format:
1. yes
2. no
3. yes"""

    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        result_text = response.text.strip().lower()
        
        results = [None] * len(quotes_batch)
        for line in result_text.split('\n'):
            line = line.strip()
            if not line:
                continue
            parts = line.replace('.', ' ').split()
            if len(parts) >= 2:
                try:
                    idx = int(parts[0]) - 1
                    if 0 <= idx < len(results):
                        results[idx] = parts[-1] == 'yes'
                except ValueError:
                    continue
        
        for i, r in enumerate(results):
            if r is None:
                results[i] = False
        
        return results
    except Exception as e:
        print(f"    Error with {model_name}: {e}")
        return [None] * len(quotes_batch)

def fetch_quotes(target_count: int) -> List[Dict]:
    quotes: List[Dict] = []
    seen_quotes = set()
    attempts = 0
    max_attempts = target_count * 10
    
    print(f"Fetching {target_count} English quotes from Wikiquote...")
    
    while len(quotes) < target_count and attempts < max_attempts:
        attempts += 1
        
        try:
            titles = wikiquote.random_titles(lang='en', max_titles=1)
        except Exception as e:
            print(f"  Error fetching random title: {e}")
            time.sleep(1)
            continue
        
        if not titles:
            time.sleep(0.5)
            continue
        
        title = titles[0]
        
        try:
            page_quotes = wikiquote.quotes(title, lang='en')
            if page_quotes:
                quote = page_quotes[0]
                if is_valid_quote(quote) and quote not in seen_quotes:
                    seen_quotes.add(quote)
                    url = f"https://en.wikiquote.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
                    quotes.append({
                        'quote': quote,
                        'author': title,
                        'url': url
                    })
                    print(f"  Found {len(quotes)}/{target_count}: {quote[:50]}...")
        except (wikiquote.DisambiguationPageException, wikiquote.NoSuchPageException):
            pass
        except Exception as e:
            if "404" not in str(e):
                print(f"  Error fetching quotes for '{title}': {e}")
        
        time.sleep(0.1)
    
    print(f"Fetched {len(quotes)} quotes")
    return quotes

def evaluate_all_models(quotes: List[Dict]) -> Dict[str, List[bool]]:
    results = {}
    
    for model_name in MODELS_TO_TEST:
        print(f"\nEvaluating with {model_name}...")
        model_results = []
        
        for i in range(0, len(quotes), BATCH_SIZE):
            batch = quotes[i:i+BATCH_SIZE]
            batch_results = validate_quotes_batch_with_model(model_name, batch)
            model_results.extend(batch_results)
            print(f"  Processed {min(i+BATCH_SIZE, len(quotes))}/{len(quotes)} quotes")
            time.sleep(0.5)
        
        results[model_name] = model_results
    
    return results

def generate_output(quotes: List[Dict], model_results: Dict[str, List[bool]]) -> str:
    lines = []
    lines.append("=" * 100)
    lines.append("GEMINI MODEL COMPARISON FOR QUOTE VALIDATION")
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"Total Quotes: {len(quotes)}")
    lines.append("=" * 100)
    lines.append("")
    
    lines.append("SUMMARY BY MODEL:")
    lines.append("-" * 50)
    for model_name, results in model_results.items():
        accepted = sum(1 for r in results if r is True)
        rejected = sum(1 for r in results if r is False)
        errors = sum(1 for r in results if r is None)
        lines.append(f"  {model_name}:")
        lines.append(f"    Accepted: {accepted}/{len(results)} ({100*accepted/len(results):.1f}%)")
        lines.append(f"    Rejected: {rejected}/{len(results)} ({100*rejected/len(results):.1f}%)")
        if errors > 0:
            lines.append(f"    Errors: {errors}")
    lines.append("")
    
    lines.append("=" * 100)
    lines.append("DETAILED RESULTS BY QUOTE:")
    lines.append("=" * 100)
    
    for i, quote_data in enumerate(quotes):
        lines.append("")
        lines.append(f"Quote #{i+1}")
        lines.append(f"  Text: \"{quote_data['quote']}\"")
        lines.append(f"  Author: {quote_data['author']}")
        lines.append(f"  URL: {quote_data['url']}")
        lines.append("  Model Results:")
        
        for model_name, results in model_results.items():
            result = results[i] if i < len(results) else None
            if result is True:
                status = "ACCEPTED"
            elif result is False:
                status = "REJECTED"
            else:
                status = "ERROR"
            lines.append(f"    {model_name}: {status}")
        
        model_decisions = [model_results[m][i] for m in model_results]
        valid_decisions = [r for r in model_decisions if r is not None]
        has_disagreement = len(set(valid_decisions)) > 1
        if has_disagreement:
            lines.append("  ** DISAGREEMENT BETWEEN MODELS **")
    
    lines.append("")
    lines.append("=" * 100)
    lines.append("QUOTES WITH MODEL DISAGREEMENT:")
    lines.append("=" * 100)
    
    disagreements = []
    for i, quote_data in enumerate(quotes):
        model_decisions = [model_results[m][i] for m in model_results if i < len(model_results[m])]
        valid_decisions = [r for r in model_decisions if r is not None]
        if len(set(valid_decisions)) > 1:
            disagreements.append(i)
    
    if disagreements:
        for i in disagreements:
            quote_data = quotes[i]
            lines.append("")
            lines.append(f"Quote #{i+1}: \"{quote_data['quote'][:80]}...\"" if len(quote_data['quote']) > 80 else f"Quote #{i+1}: \"{quote_data['quote']}\"")
            for model_name, results in model_results.items():
                result = results[i] if i < len(results) else None
                status = "ACCEPTED" if result is True else ("REJECTED" if result is False else "ERROR")
                lines.append(f"  {model_name}: {status}")
    else:
        lines.append("  No disagreements found - all models agreed on all quotes.")
    
    return "\n".join(lines)

def main():
    quotes = fetch_quotes(QUOTES_TO_FETCH)
    
    if not quotes:
        print("No quotes fetched. Exiting.")
        return
    
    model_results = evaluate_all_models(quotes)
    
    output = generate_output(quotes, model_results)
    
    output_dir = os.path.dirname(__file__)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = os.path.join(output_dir, f'model_comparison_{timestamp}.txt')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f"\n{'='*50}")
    print(f"Results saved to: {output_file}")
    print(f"{'='*50}")
    
    print("\n" + output)

if __name__ == '__main__':
    main()
