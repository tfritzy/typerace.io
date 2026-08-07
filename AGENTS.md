# Adding a language

Treat a language as complete only when both its random-word and quote modes work end to end. Use the checklist below; do not add a dropdown entry that routes to an English fallback.

## Choose identifiers

- Use the English language name for C# and TypeScript identifiers, the native name in the UI, and the standard lowercase BCP 47/ISO language code for `slug` and `htmlLang`.
- Pick a representative flag and country code, while remembering that a language can span several countries.
- Append `<Language>500` and `<Language>Quotes` to the end of `GameMode` in `spacetimedb/Module.cs`. Never insert variants in the middle: the generated enum is part of the client/server protocol.

## Build the word mode

1. Add `spacetimedb/wordlists/<Language>500Words.cs` with exactly 500 unique, lowercase words from a reputable frequency corpus. Put the source URL in a comment.
2. Normalize the file to Unicode NFC and the language's modern standard orthography. Remove encoding damage, foreign-language leakage, proper names, markup fragments, duplicates, and unaccented duplicates of words that require diacritics. Keep genuine inflected forms; this is a typing corpus, not a dictionary.
3. Add the mode to `PhraseGenerator.GeneratePhraseForMode`. Match the generated phrase length to nearby languages with similar average word length.

## Curate the quote mode

Use the Wikiquote edition written in the target language. Prefer author pages over topic pages because attribution is clearer. A complete language requires at least 300 curated quotes. Draw from as many strong authors as the edition supports, and do not declare the language ready if reaching 300 would require padding it with weak or context-dependent material.

Every candidate must pass all of these tests:

- It is an insightful observation or a memorable, interesting idea.
- It makes sense by itself. A typist should not need the preceding sentence, a plot summary, a named fictional character, or knowledge of who is speaking.
- It is not dialogue, a stage direction, narration about a character, a lyric fragment, a catchphrase, a generic greeting, or a snippet selected only because it comes from a famous work.
- It is pleasant to type: normally one to three sentences, without citation clutter, footnote markers, editorial brackets, unusual layout, or excessive proper nouns.
- Its attribution on Wikiquote is reasonably clear. Prefer quotes with a work or publication named on the page. Skip disputed or ambiguous attributions rather than guessing.

Copy the author's words faithfully. Allowed cleanup is deliberately narrow: remove wrapper quotation marks and source annotations; collapse whitespace; normalize Unicode and typographic punctuation; and correct an unmistakable transcription typo. Do not translate, paraphrase, combine separate passages, or repair a fragment by inventing context. If a quote needs substantive rewriting to stand alone, reject it. Preserve meaningful punctuation and the language's diacritics.

For each author:

1. Create `spacetimedb/quotes/<code>/<AuthorWithoutSpaces>.cs` as a nested class in `public static partial class <Language>Quotes`.
2. Set every `Quote.Id` to the direct local-language Wikiquote author-page URL, not a search result, topic page, or general homepage.
3. Set `Author` consistently to the name displayed on that page.
4. Add the author to `spacetimedb/quotes/<Language>Quotes.cs` with `.Concat(<Author>.Quotes)`.

Before keeping the set, manually read every exposed quote in its final form as a typist rather than as an extractor. Do not approve a corpus through keyword filters, scoring, bulk sampling, or automated heuristics. Remove incomplete thoughts, near-duplicates, low-information maxims, accidental spoilers, and clusters that make one author dominate. Keep the source URLs for attribution and follow the current licensing terms shown by Wikiquote/Wikimedia.

## Wire the backend and frontend

- Route the quote mode in `spacetimedb/QuoteGenerator.cs`.
- Route both modes and add a typing-speed modifier in `spacetimedb/Module.cs`.
- Add the language enum member, metadata, mode names, SEO title/description, and startup phrases in `frontend/src/utils/modes.ts`.
- Add complete native-language UI copy in `frontend/src/utils/translations.ts`; do not leave partial English copy.
- Add localized SEO/static-page metadata in `frontend/vite-plugin-i18n-html.ts` and mention the language in `frontend/index.html`.
- Add the language's static route for both Firebase hosting targets in `firebase.json`.

## Validate the result

1. Confirm the word list has exactly 500 unique NFC strings, only expected letters/apostrophes, and no whitespace inside an entry.
2. Confirm the aggregate contains at least 300 unique quotes, then confirm every quote has nonempty text and author, a direct HTTPS Wikiquote URL, balanced C# quotes, no duplicate text, and no raw newlines or annotation debris. Put any lasting automated validation in the repository's established test suite rather than committing one-off corpus scripts. Mechanical checks never replace the required quote-by-quote editorial read.
3. Build the backend with `dotnet build spacetimedb/StdbModule.csproj`.
4. Regenerate both checked-in clients after any `GameMode` change:

   ```sh
   spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb
   spacetime generate --lang typescript --out-dir tui/module_bindings --project-path spacetimedb
   ```

5. Run `npm run build --prefix frontend`, `npm test --prefix frontend`, and the TUI checks if its generated bindings changed.
6. Inspect the generated diff. It should add the two enum variants without unrelated schema churn, and the frontend build should contain `<code>/index.html` with the right `lang`, canonical URL, and hreflang entry.
