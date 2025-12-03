#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import time
import os
from typing import List, Dict
import google.generativeai as genai

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(opener)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.5-pro')

WIKIQUOTE_PAGES = [
    "Albert_Einstein",
    "Maya_Angelou",
    "Oscar_Wilde",
    "Mark_Twain",
    "Winston_Churchill",
    "Friedrich_Nietzsche",
    "Ralph_Waldo_Emerson",
    "Abraham_Lincoln",
    "Martin_Luther_King_Jr.",
    "Benjamin_Franklin",
    "William_Shakespeare",
    "Eleanor_Roosevelt",
    "Mahatma_Gandhi",
    "Nelson_Mandela",
    "Jane_Austen",
    "Virginia_Woolf",
    "James_Baldwin",
    "Toni_Morrison",
    "Gabriel_García_Márquez",
    "Ernest_Hemingway",
    "Bertrand_Russell",
    "Søren_Kierkegaard",
    "Simone_de_Beauvoir",
    "Michel_de_Montaigne",
    "Arthur_Schopenhauer",
    "Jorge_Luis_Borges",
    "Kurt_Vonnegut",
    "George_Orwell",
    "Ray_Bradbury",
    "Ursula_K._Le_Guin",
    "W._H._Auden",
    "Emily_Dickinson",
    "Langston_Hughes",
    "George_Bernard_Shaw",
    "H._L._Mencken",
    "Dorothy_Parker",
    "Gore_Vidal",
    "Christopher_Hitchens",
    "Leo_Tolstoy",
    "Fyodor_Dostoevsky",
    "Franz_Kafka",
    "Charles_Dickens",
    "Herman_Melville",
    "Carl_Sagan",
    "Richard_Feynman",
    "Isaac_Asimov",
]

def fetch_wikiquote_page(page_name: str, lang: str = 'en') -> str:
    url = f"https://{lang}.wikiquote.org/w/api.php"
    params = {
        'action': 'parse',
        'page': page_name,
        'format': 'json',
        'prop': 'wikitext',
    }
    
    full_url = f"{url}?{urllib.parse.urlencode(params)}"
    
    try:
        with urllib.request.urlopen(full_url, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            if 'parse' in data and 'wikitext' in data['parse']:
                return data['parse']['wikitext']['*']
    except Exception as e:
        print(f"  Error fetching {page_name}: {e}")
    
    return ""

def extract_quotes_with_gemini(page_name: str, page_content: str) -> List[Dict[str, str]]:
    prompt = f"""You are analyzing a Wikiquote page for "{page_name}". Extract ONLY the most interesting, thought-provoking, and timeless quotes from this page.

CRITICAL REQUIREMENTS - Be HIGHLY selective:
- Only include quotes that are genuinely profound, insightful, or memorable
- Must be 20-300 characters long
- Must be immediately understandable WITHOUT needing context
- Must stand alone as a complete, meaningful thought
- Should be applicable or interesting to a modern audience
- Must be well-crafted prose, not casual conversation
- Should inspire reflection or provide wisdom

ABSOLUTELY REJECT quotes that:
- Are casual dialog from movies, TV shows, or fiction
- Require context to understand (references to specific events, people, or situations not in the quote)
- Are answers to unspoken questions
- Contain proper nouns of obscure people/places/events
- Are screenplay-style dialog or banter
- Are merely factual statements without insight
- Use archaic language that's hard to understand
- Are overly specific to a time period or situation
- Contain brackets, citations, or markup
- Are fragments, lists, or incomplete thoughts
- Have typos or grammatical errors
- Sound like they're from an interview Q&A

PREFER quotes that:
- Express universal truths or human experiences
- Offer philosophical insights or wisdom
- Are beautifully written or poetic
- Would make someone pause and think
- Are from essays, speeches, letters, or literary works
- Have stood the test of time

For each quote you select (aim for only the TOP 10-20 best quotes from the page):
1. The quote text (cleaned of wiki markup and citations)
2. A simplified attribution: just "{page_name.replace('_', ' ')} on [topic/context]"

Format as JSON:
[
  {{
    "quote": "The quote text",
    "attribution": "{page_name.replace('_', ' ')} on [brief topic]"
  }}
]

Only return your TOP selections. Quality over quantity. If the page doesn't have many great quotes, that's fine - return fewer.

Page content:

{page_content[:50000]}

Return ONLY the JSON array."""

    try:
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()
        
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        quotes = json.loads(result_text)
        return quotes
    except json.JSONDecodeError as e:
        print(f"  JSON parsing error for {page_name}: {e}")
        print(f"  Response was: {result_text[:500]}")
        return []
    except Exception as e:
        print(f"  Error processing {page_name} with Gemini: {e}")
        return []

def sanitize_class_name(page_name: str) -> str:
    name = page_name.replace('_', '').replace('.', '').replace('-', '')
    name = ''.join(c for c in name if c.isalnum())
    return name

def escape_csharp_string(s: str) -> str:
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')

def generate_csharp_file(page_name: str, quotes: List[Dict[str, str]], output_dir: str) -> str:
    class_name = sanitize_class_name(page_name)
    
    lines = []
    lines.append("using System;")
    lines.append("")
    lines.append("namespace StdbModule;")
    lines.append("")
    lines.append(f"public static partial class EnglishQuotes")
    lines.append("{")
    lines.append(f"    public static class {class_name}")
    lines.append("    {")
    lines.append(f"        public static readonly Quote[] Quotes = new Quote[]")
    lines.append("        {")
    
    for quote in quotes:
        quote_text = escape_csharp_string(quote['quote'])
        attribution = escape_csharp_string(quote['attribution'])
        url = f"https://en.wikiquote.org/wiki/{page_name}"
        lines.append(f'            new Quote {{ Id = "{url}", Text = "{quote_text}", Author = "{attribution}" }},')
    
    lines.append("        };")
    lines.append("    }")
    lines.append("}")
    
    filename = f"{class_name}.cs"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    return class_name

def generate_main_csharp_file(class_names: List[str], output_dir: str):
    lines = []
    lines.append("using System;")
    lines.append("using System.Linq;")
    lines.append("")
    lines.append("public static partial class EnglishQuotes")
    lines.append("{")
    lines.append("    public static readonly Quote[] Quotes = ")
    
    for i, class_name in enumerate(class_names):
        if i == 0:
            lines.append(f"        {class_name}.Quotes")
        else:
            lines.append(f"        .Concat({class_name}.Quotes)")
    
    lines.append("        .ToArray();")
    lines.append("}")
    
    filepath = os.path.join(output_dir, "..", "EnglishQuotes.cs")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

def main():
    all_quotes = []
    quotes_by_author = {}
    
    output_dir = '../spacetimedb/quotes/gemini'
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Processing {len(WIKIQUOTE_PAGES)} Wikiquote pages...")
    print(f"Using model: gemini-2.5-pro")
    print(f"Output directory: {output_dir}")
    
    for i, page_name in enumerate(WIKIQUOTE_PAGES):
        print(f"\n[{i+1}/{len(WIKIQUOTE_PAGES)}] Processing {page_name}...")
        
        page_content = fetch_wikiquote_page(page_name)
        if not page_content:
            print(f"  Failed to fetch page content")
            continue
        
        print(f"  Page content length: {len(page_content)} characters")
        
        quotes = extract_quotes_with_gemini(page_name, page_content)
        print(f"  Extracted {len(quotes)} quotes")
        
        if quotes:
            quotes_by_author[page_name] = quotes
            all_quotes.extend(quotes)
            
            for quote in quotes[:3]:
                print(f"    - \"{quote['quote'][:60]}...\" - {quote['attribution']}")
        
        time.sleep(3)
    
    print(f"\n\nTotal quotes extracted: {len(all_quotes)}")
    
    print("\nGenerating C# files...")
    class_names = []
    for page_name, quotes in quotes_by_author.items():
        class_name = generate_csharp_file(page_name, quotes, output_dir)
        class_names.append(class_name)
        print(f"  Generated gemini/{class_name}.cs with {len(quotes)} quotes")
    
    generate_main_csharp_file(class_names, output_dir)
    print(f"\nGenerated EnglishQuotes.cs (top-level) with {len(class_names)} author classes")
    
    print("\nSample quotes:")
    for quote in all_quotes[:5]:
        print(f"\n\"{quote['quote']}\"")
        print(f"  - {quote['attribution']}")
    
    output_file = 'extracted_quotes.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_quotes, f, indent=2, ensure_ascii=False)
    
    print(f"\n\nQuotes also saved to {output_file}")

if __name__ == "__main__":
    main()
