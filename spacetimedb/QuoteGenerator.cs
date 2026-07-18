using System;

namespace StdbModule;

public static class QuoteGenerator
{
    public static Phrase GetRandomQuote(GameMode mode, Random rng)
    {
        Quote[] quotes = mode switch
        {
            GameMode.EnglishQuotes => EnglishQuotes.Quotes,
            GameMode.SpanishQuotes => SpanishQuotes.Quotes,
            GameMode.FrenchQuotes => FrenchQuotes.Quotes,
            GameMode.GermanQuotes => GermanQuotes.Quotes,
            GameMode.ItalianQuotes => ItalianQuotes.Quotes,
            GameMode.PortugueseQuotes => PortugueseQuotes.Quotes,
            GameMode.JapaneseQuotes => JapaneseQuotes.Quotes,
            GameMode.KoreanQuotes => KoreanQuotes.Quotes,
            GameMode.ChineseQuotes => ChineseQuotes.Quotes,
            GameMode.UkrainianQuotes => UkrainianQuotes.Quotes,
            GameMode.ArabicQuotes => ArabicQuotes.Quotes,
            GameMode.HindiQuotes => HindiQuotes.Quotes,
            GameMode.DutchQuotes => DutchQuotes.Quotes,
            GameMode.SwedishQuotes => SwedishQuotes.Quotes,
            GameMode.TurkishQuotes => TurkishQuotes.Quotes,
            GameMode.RussianQuotes => RussianQuotes.Quotes,
            _ => EnglishQuotes.Quotes
        };

        if (quotes.Length == 0)
        {
            return new Phrase("No quotes available for this language.");
        }

        int index = rng.Next(quotes.Length);
        var quote = quotes[index];
        return new Phrase(
            PhraseGenerator.SanitizeText(quote.Text),
            quote.Author != null ? PhraseGenerator.SanitizeText(quote.Author) : null
        );
    }
}
