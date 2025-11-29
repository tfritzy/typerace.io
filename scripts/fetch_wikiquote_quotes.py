#!/usr/bin/env python3
import urllib.request
import wikiquote
import time
import json
import os
from typing import List, Dict, Tuple

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(opener)

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
MAX_FETCH_ATTEMPTS = 2000

def is_valid_quote(quote: str) -> bool:
    if not quote or len(quote) < 20 or len(quote) > 300:
        return False
    if any(x in quote.lower() for x in ['http', 'www.', '.com', '.org']):
        return False
    return True

def fetch_quotes_for_language(lang_code: str, target_count: int) -> Dict[str, str]:
    quotes: Dict[str, str] = {}
    attempts = 0
    
    print(f"Fetching quotes for language: {lang_code}")
    
    supported_langs = wikiquote.supported_languages()
    if lang_code not in supported_langs:
        print(f"  Warning: Language {lang_code} not supported by wikiquote package")
        print(f"  Supported languages: {supported_langs}")
        return quotes
    
    while len(quotes) < target_count and attempts < MAX_FETCH_ATTEMPTS:
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
                if is_valid_quote(quote) and quote not in quotes:
                    quotes[quote] = title
                    if len(quotes) % 50 == 0:
                        print(f"  Progress: {len(quotes)}/{target_count} quotes")
        except (wikiquote.DisambiguationPageException, wikiquote.NoSuchPageException):
            pass
        except Exception as e:
            print(f"  Error fetching quotes for '{title}': {e}")
        
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

def generate_csharp_class(class_name: str, quotes: Dict[str, str]) -> str:
    lines = ['using System;', '', f'public static class {class_name}', '{']
    lines.append('    public static readonly (int Id, string Quote, string Author)[] Quotes = new (int, string, string)[]')
    lines.append('    {')
    
    quote_items = list(quotes.items())
    for i, (quote, author) in enumerate(quote_items):
        escaped_quote = escape_csharp_string(quote)
        escaped_author = escape_csharp_string(author)
        comma = ',' if i < len(quote_items) - 1 else ''
        lines.append(f'        ({i}, "{escaped_quote}", "{escaped_author}"){comma}')
    
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
        
        cache_file = os.path.join(output_dir, f'{lang_code}_quotes.json')
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump([{"quote": q, "author": a} for q, a in quotes.items()], f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*50)
    print("Quote fetching complete!")
    print("="*50)

if __name__ == '__main__':
    main()
