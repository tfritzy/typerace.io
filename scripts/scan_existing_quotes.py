#!/usr/bin/env python3
import os
import re
import json
from typing import Dict, List, Set
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ALLOWLIST_FILE = os.path.join(SCRIPT_DIR, 'character_allowlist.json')
QUOTES_DIR = os.path.join(SCRIPT_DIR, '..', 'spacetimedb', 'quotes')

def load_allowlist() -> Dict[str, Set[str]]:
    with open(ALLOWLIST_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return {
            lang: set(config['characters']) 
            for lang, config in data.items()
        }

def extract_quotes_from_cs(file_path: str) -> List[Dict]:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'new Quote \{ Id = "([^"]*)", Text = "([^"]*)", Author = "([^"]*)" \}'
    matches = re.findall(pattern, content)
    
    quotes = []
    for id_url, text, author in matches:
        text = text.replace('\\"', '"').replace('\\n', '\n').replace('\\r', '\r').replace('\\t', '\t')
        author = author.replace('\\"', '"')
        quotes.append({
            'id': id_url,
            'text': text,
            'author': author,
            'file': file_path
        })
    return quotes

def scan_language_quotes(lang_code: str) -> tuple[List[Dict], List[Dict]]:
    lang_dir = os.path.join(QUOTES_DIR, lang_code)
    if not os.path.exists(lang_dir):
        print(f"Warning: Directory not found: {lang_dir}")
        return [], []
    
    all_quotes = []
    for root, dirs, files in os.walk(lang_dir):
        for file in files:
            if file.endswith('.cs') and file != f'{lang_code.capitalize()}Quotes.cs':
                file_path = os.path.join(root, file)
                quotes = extract_quotes_from_cs(file_path)
                all_quotes.extend(quotes)
    
    return all_quotes

def check_quotes_validity(quotes: List[Dict], allowed_chars: Set[str]) -> tuple[List[Dict], List[Dict]]:
    valid_quotes = []
    invalid_quotes = []
    
    for quote in quotes:
        text = quote['text']
        author = quote['author']
        
        text_invalid_chars = [c for c in text if c not in allowed_chars]
        author_invalid_chars = [c for c in author if c not in allowed_chars]
        
        if not text_invalid_chars and not author_invalid_chars:
            valid_quotes.append(quote)
        else:
            invalid_quotes.append({
                'quote': quote,
                'text_invalid_chars': list(set(text_invalid_chars)),
                'author_invalid_chars': list(set(author_invalid_chars))
            })
    
    return valid_quotes, invalid_quotes

def main():
    if len(sys.argv) < 2:
        print("Usage: python scan_existing_quotes.py <language_code>")
        print("Example: python scan_existing_quotes.py en")
        print("\nScans all existing quotes in the codebase for the specified language")
        print("and validates them against the character allowlist.")
        sys.exit(1)
    
    lang_code = sys.argv[1]
    allowlist = load_allowlist()
    
    if lang_code not in allowlist:
        print(f"Error: Language code '{lang_code}' not found in allowlist")
        print(f"Available languages: {', '.join(allowlist.keys())}")
        sys.exit(1)
    
    allowed_chars = allowlist[lang_code]
    
    print(f"\n=== Scanning existing quotes for {lang_code} ===")
    all_quotes = scan_language_quotes(lang_code)
    print(f"Total quotes found: {len(all_quotes)}")
    
    if not all_quotes:
        print("No quotes found. Exiting.")
        return
    
    valid_quotes, invalid_quotes = check_quotes_validity(all_quotes, allowed_chars)
    
    print(f"\nValidation Results:")
    print(f"Valid quotes: {len(valid_quotes)} ({len(valid_quotes)/len(all_quotes)*100:.1f}%)")
    print(f"Invalid quotes: {len(invalid_quotes)} ({len(invalid_quotes)/len(all_quotes)*100:.1f}%)")
    
    if invalid_quotes:
        print(f"\n=== Invalid Quotes (showing first 20) ===")
        for idx, info in enumerate(invalid_quotes[:20], 1):
            quote = info['quote']
            print(f"\n{idx}. File: {quote['file']}")
            print(f"   Text: \"{quote['text'][:80]}{'...' if len(quote['text']) > 80 else ''}\"")
            print(f"   Author: {quote['author']}")
            if info['text_invalid_chars']:
                print(f"   Invalid chars in text: {info['text_invalid_chars']}")
            if info['author_invalid_chars']:
                print(f"   Invalid chars in author: {info['author_invalid_chars']}")
        
        if len(invalid_quotes) > 20:
            print(f"\n... and {len(invalid_quotes) - 20} more invalid quotes")
        
        invalid_output_file = f'invalid_existing_quotes_{lang_code}.json'
        with open(invalid_output_file, 'w', encoding='utf-8') as f:
            json.dump(invalid_quotes, f, indent=2, ensure_ascii=False)
        print(f"\nAll invalid quotes saved to {invalid_output_file}")
    else:
        print("\nAll quotes are valid! ✓")

if __name__ == "__main__":
    main()
