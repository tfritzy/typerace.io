#!/usr/bin/env python3
import json
import os
import sys
from typing import Dict, List, Set

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ALLOWLIST_FILE = os.path.join(SCRIPT_DIR, 'character_allowlist.json')

def load_allowlist() -> Dict[str, Set[str]]:
    with open(ALLOWLIST_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return {
            lang: set(config['characters']) 
            for lang, config in data.items()
        }

def check_text_validity(text: str, allowed_chars: Set[str]) -> tuple[bool, List[str]]:
    invalid_chars = []
    for char in text:
        if char not in allowed_chars:
            if char not in invalid_chars:
                invalid_chars.append(char)
    return len(invalid_chars) == 0, invalid_chars

def scrub_quotes(quotes: List[Dict], lang_code: str, allowed_chars: Set[str]) -> tuple[List[Dict], List[Dict]]:
    valid_quotes = []
    invalid_quotes = []
    
    for quote in quotes:
        text = quote.get('quote', quote.get('Text', ''))
        attribution = quote.get('attribution', quote.get('Author', ''))
        
        text_valid, text_invalid_chars = check_text_validity(text, allowed_chars)
        attr_valid, attr_invalid_chars = check_text_validity(attribution, allowed_chars)
        
        if text_valid and attr_valid:
            valid_quotes.append(quote)
        else:
            invalid_info = {
                'quote': quote,
                'invalid_chars': []
            }
            if not text_valid:
                invalid_info['text_invalid_chars'] = text_invalid_chars
            if not attr_valid:
                invalid_info['attribution_invalid_chars'] = attr_invalid_chars
            invalid_quotes.append(invalid_info)
    
    return valid_quotes, invalid_quotes

def main():
    if len(sys.argv) < 2:
        print("Usage: python scrub_quotes.py <language_code> [input_file]")
        print("Example: python scrub_quotes.py en extracted_quotes_en.json")
        print("\nIf input_file is not provided, reads from stdin")
        sys.exit(1)
    
    lang_code = sys.argv[1]
    allowlist = load_allowlist()
    
    if lang_code not in allowlist:
        print(f"Error: Language code '{lang_code}' not found in allowlist")
        print(f"Available languages: {', '.join(allowlist.keys())}")
        sys.exit(1)
    
    allowed_chars = allowlist[lang_code]
    
    if len(sys.argv) >= 3:
        input_file = sys.argv[2]
        with open(input_file, 'r', encoding='utf-8') as f:
            quotes = json.load(f)
    else:
        quotes = json.load(sys.stdin)
    
    valid_quotes, invalid_quotes = scrub_quotes(quotes, lang_code, allowed_chars)
    
    print(f"\n=== Scrubbing Results for {lang_code} ===")
    print(f"Total quotes: {len(quotes)}")
    print(f"Valid quotes: {len(valid_quotes)} ({len(valid_quotes)/len(quotes)*100:.1f}%)")
    print(f"Invalid quotes: {len(invalid_quotes)} ({len(invalid_quotes)/len(quotes)*100:.1f}%)")
    
    if invalid_quotes:
        print(f"\n=== Invalid Quotes ===")
        for idx, info in enumerate(invalid_quotes[:10], 1):
            quote = info['quote']
            print(f"\n{idx}. \"{quote.get('quote', quote.get('Text', ''))[:80]}...\"")
            if 'text_invalid_chars' in info:
                print(f"   Invalid chars in text: {info['text_invalid_chars']}")
            if 'attribution_invalid_chars' in info:
                print(f"   Invalid chars in attribution: {info['attribution_invalid_chars']}")
        
        if len(invalid_quotes) > 10:
            print(f"\n... and {len(invalid_quotes) - 10} more invalid quotes")
    
    output_file = f'scrubbed_quotes_{lang_code}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(valid_quotes, f, indent=2, ensure_ascii=False)
    
    print(f"\nValid quotes saved to {output_file}")
    
    if invalid_quotes:
        invalid_output_file = f'invalid_quotes_{lang_code}.json'
        with open(invalid_output_file, 'w', encoding='utf-8') as f:
            json.dump(invalid_quotes, f, indent=2, ensure_ascii=False)
        print(f"Invalid quotes saved to {invalid_output_file}")

if __name__ == "__main__":
    main()
