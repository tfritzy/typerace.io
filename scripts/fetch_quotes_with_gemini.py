#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import time
import os
import argparse
from typing import List, Dict
import google.generativeai as genai
from google.genai import Client as GenAIClient
from google.genai import types as genai_types

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(opener)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(SCRIPT_DIR, 'language_authors_config.json')

def load_language_config() -> Dict:
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

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

def process_gemini_response(response_text: str, page_name: str) -> List[Dict[str, str]]:
    try:
        result_text = response_text.strip()
        
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
        print(f"  Error processing {page_name}: {e}")
        return []

def extract_quotes_batch(page_data: List[Dict], model_name: str = 'gemini-2.5-pro') -> Dict[str, List[Dict[str, str]]]:
    import tempfile
    
    client = GenAIClient(api_key=GEMINI_API_KEY)
    
    batch_requests = []
    for data in page_data:
        prompt = create_extraction_prompt(
            data['page_name'],
            data['page_content'],
            data['lang_code'],
            data['lang_name']
        )
        request = {
            "key": data['page_name'],
            "request": {
                "contents": [{
                    "parts": [{"text": prompt}],
                    "role": "user"
                }]
            }
        }
        batch_requests.append(request)
    
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.jsonl', delete=False) as f:
            for item in batch_requests:
                json.dump(item, f)
                f.write('\n')
            temp_file = f.name
        
        print(f"  Uploading batch file with {len(batch_requests)} requests...")
        uploaded_file = client.files.upload(
            file=temp_file,
            config=genai_types.UploadFileConfig(
                display_name='quote-extraction-batch',
                mime_type='jsonl'
            )
        )
        
        print(f"  Creating batch job...")
        batch_job = client.batches.create(
            model=f"models/{model_name}",
            src=uploaded_file.name,
            config={
                'display_name': "quote-extraction-job",
            }
        )
        
        print(f"  Batch job created: {batch_job.name}")
        print(f"  Waiting for batch job to complete...")
        
        completed_states = {'JOB_STATE_SUCCEEDED', 'JOB_STATE_FAILED', 'JOB_STATE_CANCELLED', 'JOB_STATE_EXPIRED'}
        
        while batch_job.state.name not in completed_states:
            time.sleep(30)
            batch_job = client.batches.get(name=batch_job.name)
            print(f"  Batch job status: {batch_job.state.name}")
        
        print(f"  Job finished with state: {batch_job.state.name}")
        
        if batch_job.state.name != 'JOB_STATE_SUCCEEDED':
            print(f"  Batch job failed: {batch_job.error if hasattr(batch_job, 'error') else 'Unknown error'}")
            return {}
        
        print(f"  Downloading results...")
        result_file_name = batch_job.dest.file_name
        file_content_bytes = client.files.download(file=result_file_name)
        file_content = file_content_bytes.decode('utf-8')
        
        results = {}
        for line in file_content.splitlines():
            if line:
                parsed_response = json.loads(line)
                page_name = parsed_response.get('key', '')
                
                if 'response' in parsed_response and parsed_response['response']:
                    candidates = parsed_response['response'].get('candidates', [])
                    if candidates and len(candidates) > 0:
                        parts = candidates[0].get('content', {}).get('parts', [])
                        if parts and len(parts) > 0:
                            response_text = parts[0].get('text', '')
                            quotes = process_gemini_response(response_text, page_name)
                            results[page_name] = quotes
                        else:
                            results[page_name] = []
                    else:
                        results[page_name] = []
                elif 'error' in parsed_response:
                    print(f"  Error for {page_name}: {parsed_response['error']}")
                    results[page_name] = []
        
        os.unlink(temp_file)
        
        return results
    except Exception as e:
        print(f"  Error in batch processing: {e}")
        import traceback
        traceback.print_exc()
        raise

def create_extraction_prompt(page_name: str, page_content: str, lang_code: str = 'en', lang_name: str = 'English') -> str:
    language_instruction = ""
    if lang_code != 'en':
        language_instruction = f"""
IMPORTANT: Extract quotes in their ORIGINAL {lang_name} language ONLY. 
- Do NOT include English translations
- Do NOT include quotes that are translated from other languages
- Only include quotes that were originally written in {lang_name}
"""

    prompt = f"""You are analyzing a Wikiquote page for "{page_name}" in {lang_name}. Extract all good quotes from this page that meet the criteria below.

{language_instruction}

REQUIREMENTS:
- Must be 20-300 characters long
- Must be immediately understandable WITHOUT needing context
- Must stand alone as a complete, meaningful thought
- Should be well-crafted prose, not casual conversation

REJECT quotes that:
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

Extract as many quotes as meet these criteria - there is no limit. If an author has many good quotes, include them all.

For each quote you select:
1. The quote text (cleaned of wiki markup and citations)
2. A simplified attribution: just the author name without underscores

Format as JSON:
[
  {{
    "quote": "The quote text in original language",
    "attribution": "Author Name"
  }}
]

For this page, the attribution should be: {page_name.replace('_', ' ')}

Page content:

{page_content[:50000]}

Return ONLY the JSON array."""
    return prompt

def sanitize_class_name(page_name: str) -> str:
    name = page_name.replace('_', '').replace('.', '').replace('-', '')
    name = ''.join(c for c in name if c.isalnum())
    return name

def escape_csharp_string(s: str) -> str:
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')

def generate_csharp_file(page_name: str, quotes: List[Dict[str, str]], output_dir: str, lang_code: str = 'en', class_name_prefix: str = 'EnglishQuotes') -> str:
    class_name = sanitize_class_name(page_name)
    
    lines = []
    lines.append("using System;")
    lines.append("")
    lines.append("namespace StdbModule;")
    lines.append("")
    lines.append(f"public static partial class {class_name_prefix}")
    lines.append("{")
    lines.append(f"    public static class {class_name}")
    lines.append("    {")
    lines.append(f"        public static readonly Quote[] Quotes = new Quote[]")
    lines.append("        {")
    
    for quote in quotes:
        quote_text = escape_csharp_string(quote['quote'])
        attribution = escape_csharp_string(quote['attribution'])
        url = f"https://{lang_code}.wikiquote.org/wiki/{page_name}"
        lines.append(f'            new Quote {{ Id = "{url}", Text = "{quote_text}", Author = "{attribution}" }},')
    
    lines.append("        };")
    lines.append("    }")
    lines.append("}")
    
    filename = f"{class_name}.cs"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    return class_name

def generate_main_csharp_file(class_names: List[str], output_dir: str, class_name_prefix: str = 'EnglishQuotes'):
    lines = []
    lines.append("using System;")
    lines.append("using System.Linq;")
    lines.append("")
    lines.append(f"public static partial class {class_name_prefix}")
    lines.append("{")
    lines.append("    public static readonly Quote[] Quotes = ")
    
    for i, class_name in enumerate(class_names):
        if i == 0:
            lines.append(f"        {class_name}.Quotes")
        else:
            lines.append(f"        .Concat({class_name}.Quotes)")
    
    lines.append("        .ToArray();")
    lines.append("}")
    
    filepath = os.path.join(output_dir, "..", f"{class_name_prefix}.cs")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

def main():
    parser = argparse.ArgumentParser(
        description='Fetch quotes from Wikiquote for specific languages and authors',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process English quotes (default)
  python fetch_quotes_with_gemini.py
  
  # Process Spanish quotes
  python fetch_quotes_with_gemini.py --lang es
  
  # Process French quotes with custom output
  python fetch_quotes_with_gemini.py --lang fr --output-dir /custom/path
        """
    )
    
    parser.add_argument('--lang', default='en', help='Language code (default: en)')
    parser.add_argument('--output-dir', default='../spacetimedb/quotes', help='Output directory for generated C# files')
    parser.add_argument('--all', action='store_true', help='Process all languages defined in the config')
    
    args = parser.parse_args()
    
    config = load_language_config()

    model_name = 'gemini-2.5-flash-lite'

    def process_language(lang_code: str):
        if lang_code not in config:
            print(f"Error: Language '{lang_code}' not found in config")
            return

        lang_config = config[lang_code]
        lang_name = lang_config['name']
        class_name_prefix = lang_config['class_name']
        authors = lang_config['authors']

        print(f"\nProcessing {lang_name} ({lang_code})")
        print(f"Using model: {model_name} (Batch API - 50% cost savings)")
        print(f"Output directory: {args.output_dir}")
        print(f"Authors to process: {len(authors)}")

        all_quotes = []
        quotes_by_author = {}

        output_dir = os.path.join(args.output_dir, lang_code, 'gemini')
        os.makedirs(output_dir, exist_ok=True)

        print(f"\nFetching Wikiquote pages...")
        page_data = []
        for i, page_name in enumerate(authors):
            print(f"[{i+1}/{len(authors)}] Fetching {page_name}...")
            page_content = fetch_wikiquote_page(page_name, lang_code)
            if page_content:
                page_data.append({
                    'page_name': page_name,
                    'page_content': page_content,
                    'lang_code': lang_code,
                    'lang_name': lang_name
                })
                print(f"  Content length: {len(page_content)} characters")
            else:
                print(f"  Failed to fetch page content")
            time.sleep(0.5)

        if not page_data:
            print("No pages fetched for this language, skipping.")
            return

        print(f"\nProcessing {len(page_data)} pages with Gemini batch API...")

        batch_results = extract_quotes_batch(page_data, model_name)

        for page_name, quotes in batch_results.items():
            print(f"\n{page_name}: {len(quotes)} quotes")
            if quotes:
                quotes_by_author[page_name] = quotes
                all_quotes.extend(quotes)
                for quote in quotes[:3]:
                    print(f"  - \"{quote['quote'][:60]}...\" - {quote['attribution']}")

        print(f"\n\nTotal quotes extracted: {len(all_quotes)}")

        print("\nGenerating C# files...")
        class_names = []
        for page_name, quotes in quotes_by_author.items():
            class_name = generate_csharp_file(page_name, quotes, output_dir, lang_code, class_name_prefix)
            class_names.append(class_name)
            print(f"  Generated {lang_code}/gemini/{class_name}.cs with {len(quotes)} quotes")

        generate_main_csharp_file(class_names, output_dir, class_name_prefix)
        print(f"\nGenerated {class_name_prefix}.cs (top-level) with {len(class_names)} author classes")

        print("\nSample quotes:")
        for quote in all_quotes[:5]:
            print(f"\n\"{quote['quote']}\"")
            print(f"  - {quote['attribution']}")

        output_file = f'extracted_quotes_{lang_code}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_quotes, f, indent=2, ensure_ascii=False)

        print(f"\n\nQuotes also saved to {output_file}")

    # Run for all languages or a single one
    if args.all:
        for lc in config.keys():
            process_language(lc)
    else:
        if args.lang not in config:
            print(f"Error: Language '{args.lang}' not found in config")
            print("\nAvailable languages:")
            for lang_code, lang_conf in config.items():
                print(f"  {lang_code}: {lang_conf['name']} ({len(lang_conf['authors'])} authors)")
            exit(1)
        process_language(args.lang)

if __name__ == "__main__":
    main()