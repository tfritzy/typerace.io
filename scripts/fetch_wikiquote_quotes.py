#!/usr/bin/env python3
import urllib.request
import urllib.parse
import wikiquote
import time
import os
import google.generativeai as genai
from typing import Dict

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(opener)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.0-flash')

LANGUAGE_CONFIG = {
    'English': {'code': 'en', 'class_name': 'EnglishQuotes'},
    'Spanish': {'code': 'es', 'class_name': 'SpanishQuotes'},
    'French': {'code': 'fr', 'class_name': 'FrenchQuotes'},
    'German': {'code': 'de', 'class_name': 'GermanQuotes'},
    'Italian': {'code': 'it', 'class_name': 'ItalianQuotes'},
    'Portuguese': {'code': 'pt', 'class_name': 'PortugueseQuotes'},
    'Japanese': {'code': 'ja', 'class_name': 'JapaneseQuotes'},
    'Korean': {'code': 'ko', 'class_name': 'KoreanQuotes'},
    'Chinese': {'code': 'zh', 'class_name': 'ChineseQuotes'},
    'Ukrainian': {'code': 'uk', 'class_name': 'UkrainianQuotes'},
    'Arabic': {'code': 'ar', 'class_name': 'ArabicQuotes'},
    'Hindi': {'code': 'hi', 'class_name': 'HindiQuotes'},
    'Dutch': {'code': 'nl', 'class_name': 'DutchQuotes'},
    'Swedish': {'code': 'sv', 'class_name': 'SwedishQuotes'},
    'Turkish': {'code': 'tr', 'class_name': 'TurkishQuotes'},
}

QUOTES_PER_LANGUAGE = 1000
MAX_FETCH_ATTEMPTS = 3000

def is_valid_quote(quote: str) -> bool:
    if not quote or len(quote) < 20 or len(quote) > 300:
        return False
    if any(x in quote.lower() for x in ['http', 'www.', '.com', '.org']):
        return False
    return True

def validate_quotes_batch_with_gemini(quotes_batch: list) -> list:
    if not GEMINI_API_KEY or not quotes_batch:
        return [True] * len(quotes_batch)
    
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
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip().lower()
        
        results = [True] * len(quotes_batch)
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
        return results
    except Exception as e:
        print(f"    Gemini batch validation error: {e}")
        return [True] * len(quotes_batch)

def fetch_quotes_for_language(lang_code: str, target_count: int) -> Dict[str, tuple]:
    quotes: Dict[str, tuple] = {}
    attempts = 0
    pending_quotes = []
    BATCH_SIZE = 10
    
    print(f"Fetching quotes for language: {lang_code}")
    
    supported_langs = wikiquote.supported_languages()
    if lang_code not in supported_langs:
        print(f"  Warning: Language {lang_code} not supported by wikiquote package")
        print(f"  Supported languages: {supported_langs}")
        return quotes
    
    def process_batch():
        nonlocal pending_quotes
        if not pending_quotes:
            return
        
        results = validate_quotes_batch_with_gemini(pending_quotes)
        for pq, is_valid in zip(pending_quotes, results):
            if is_valid:
                quotes[pq['quote']] = (pq['author'], pq['url'])
            else:
                print(f"    Rejected by Gemini: {pq['quote'][:50]}...")
        pending_quotes = []
        if quotes:
            print(f"  Progress: {len(quotes)}/{target_count} quotes")
    
    while len(quotes) + len(pending_quotes) < target_count + BATCH_SIZE and attempts < MAX_FETCH_ATTEMPTS:
        attempts += 1
        
        try:
            titles = wikiquote.random_titles(lang=lang_code, max_titles=1)
        except Exception as e:
            print(f"  Error fetching random title: {e}")
            time.sleep(1)
            continue
        
        if not titles:
            print(f"  No title found, attempt {attempts}/{MAX_FETCH_ATTEMPTS}")
            time.sleep(1)
            continue
        
        title = titles[0]
        
        try:
            page_quotes = wikiquote.quotes(title, lang=lang_code)
            if page_quotes:
                quote = page_quotes[0]
                if is_valid_quote(quote) and quote not in quotes and not any(pq['quote'] == quote for pq in pending_quotes):
                    url = f"https://{lang_code}.wikiquote.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
                    pending_quotes.append({'quote': quote, 'author': title, 'url': url})
                    
                    if len(pending_quotes) >= BATCH_SIZE:
                        process_batch()
                        if len(quotes) >= target_count:
                            break
        except (wikiquote.DisambiguationPageException, wikiquote.NoSuchPageException):
            pass
        except Exception as e:
            print(f"  Error fetching quotes for '{title}': {e}")
        
        time.sleep(0.1)
    
    process_batch()
    
    while len(quotes) > target_count:
        quotes.popitem()
        
        time.sleep(0.1)
    
    print(f"  Final: {len(quotes)}/{target_count} quotes (attempts: {attempts})")
    return quotes

def escape_csharp_string(s: str) -> str:
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '\\r')
    s = s.replace('\t', '\\t')
    return s

def generate_csharp_class(class_name: str, quotes: Dict[str, tuple]) -> str:
    lines = ['using System;', '']
    lines.append('public struct Quote')
    lines.append('{')
    lines.append('    public string Id;')
    lines.append('    public string Text;')
    lines.append('    public string Author;')
    lines.append('}')
    lines.append('')
    lines.append(f'public static class {class_name}')
    lines.append('{')
    lines.append('    public static readonly Quote[] Quotes = new Quote[]')
    lines.append('    {')
    
    quote_items = list(quotes.items())
    for i, (quote, (author, url)) in enumerate(quote_items):
        escaped_quote = escape_csharp_string(quote)
        escaped_author = escape_csharp_string(author)
        escaped_url = escape_csharp_string(url)
        comma = ',' if i < len(quote_items) - 1 else ''
        lines.append(f'        new Quote {{ Id = "{escaped_url}", Text = "{escaped_quote}", Author = "{escaped_author}" }}{comma}')
    
    lines.append('    };')
    lines.append('}')
    
    return '\n'.join(lines)

def main():
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'spacetimedb', 'quotes')
    os.makedirs(output_dir, exist_ok=True)
    
    for lang_name, config in LANGUAGE_CONFIG.items():
        lang_code = config['code']
        class_name = config['class_name']
        
        print(f"\n{'='*50}")
        print(f"Processing {lang_name} ({lang_code})")
        print(f"{'='*50}")
        
        quotes = fetch_quotes_for_language(lang_code, QUOTES_PER_LANGUAGE)
        
        if len(quotes) < QUOTES_PER_LANGUAGE:
            print(f"Warning: Only fetched {len(quotes)} quotes for {lang_name}")
        
        csharp_code = generate_csharp_class(class_name, quotes)
        
        output_file = os.path.join(output_dir, f'{class_name}.cs')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(csharp_code)
        
        print(f"Generated {output_file} with {len(quotes)} quotes")
    
    print("\n" + "="*50)
    print("Quote fetching complete!")
    print("="*50)

if __name__ == '__main__':
    main()
