#!/usr/bin/env python3
import requests
import random
import time
import re
import json
import os
from typing import List, Dict, Set, Optional
from html import unescape

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

def get_random_page_titles(lang_code: str, num_titles: int = 50) -> List[str]:
    url = f"https://{lang_code}.wikiquote.org/w/api.php"
    params = {
        'action': 'query',
        'list': 'random',
        'rnnamespace': 0,
        'rnlimit': num_titles,
        'format': 'json'
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        return [page['title'] for page in data.get('query', {}).get('random', [])]
    except Exception as e:
        print(f"Error fetching random titles for {lang_code}: {e}")
        return []

def get_page_content(lang_code: str, title: str) -> Optional[str]:
    url = f"https://{lang_code}.wikiquote.org/w/api.php"
    params = {
        'action': 'query',
        'titles': title,
        'prop': 'extracts',
        'explaintext': True,
        'format': 'json'
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if page_id != '-1':
                return page_data.get('extract', '')
        return None
    except Exception as e:
        print(f"Error fetching page content for {title}: {e}")
        return None

def extract_quotes_from_text(text: str, lang_code: str) -> List[str]:
    quotes = []
    
    if not text:
        return quotes
    
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        
        if not line:
            continue
            
        if line.startswith('==') or line.startswith('*'):
            line = re.sub(r'^[=*\s]+', '', line)
            line = re.sub(r'[=]+$', '', line)
            line = line.strip()
        
        line = re.sub(r'\[.*?\]', '', line)
        line = re.sub(r'\(.*?\)', '', line)
        line = re.sub(r'—.*$', '', line)
        line = re.sub(r'-\s*[A-Z].*$', '', line)
        
        line = unescape(line)
        line = line.strip()
        
        if 20 <= len(line) <= 300:
            if not re.match(r'^[\d\s.,-]+$', line):
                if not any(x in line.lower() for x in ['http', 'www.', '.com', '.org']):
                    quotes.append(line)
    
    return quotes

def fetch_quotes_for_language(lang_code: str, target_count: int) -> Set[str]:
    quotes: Set[str] = set()
    max_attempts = 200
    attempts = 0
    
    print(f"Fetching quotes for language: {lang_code}")
    
    while len(quotes) < target_count and attempts < max_attempts:
        attempts += 1
        
        titles = get_random_page_titles(lang_code, num_titles=50)
        
        if not titles:
            print(f"  No titles found, attempt {attempts}/{max_attempts}")
            time.sleep(1)
            continue
        
        for title in titles:
            if len(quotes) >= target_count:
                break
                
            content = get_page_content(lang_code, title)
            if content:
                extracted = extract_quotes_from_text(content, lang_code)
                for quote in extracted:
                    if quote not in quotes:
                        quotes.add(quote)
                        if len(quotes) >= target_count:
                            break
            
            time.sleep(0.1)
        
        print(f"  Progress: {len(quotes)}/{target_count} quotes (attempt {attempts})")
        time.sleep(0.5)
    
    return quotes

def escape_csharp_string(s: str) -> str:
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '\\r')
    s = s.replace('\t', '\\t')
    return s

def generate_csharp_class(class_name: str, quotes: List[str]) -> str:
    lines = ['using System;', '', f'public static class {class_name}', '{']
    lines.append('    public static readonly string[] Quotes = new string[]')
    lines.append('    {')
    
    for i, quote in enumerate(quotes):
        escaped = escape_csharp_string(quote)
        comma = ',' if i < len(quotes) - 1 else ''
        lines.append(f'        "{escaped}"{comma}')
    
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
        quotes_list = list(quotes)[:QUOTES_PER_LANGUAGE]
        
        if len(quotes_list) < QUOTES_PER_LANGUAGE:
            print(f"Warning: Only fetched {len(quotes_list)} quotes for {lang_name}")
        
        csharp_code = generate_csharp_class(class_name, quotes_list)
        
        output_file = os.path.join(output_dir, f'{class_name}.cs')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(csharp_code)
        
        print(f"Generated {output_file} with {len(quotes_list)} quotes")
        
        cache_file = os.path.join(output_dir, f'{lang_code}_quotes.json')
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(quotes_list, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*50)
    print("Quote fetching complete!")
    print("="*50)

if __name__ == '__main__':
    main()
