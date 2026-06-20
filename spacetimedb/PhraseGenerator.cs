using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace StdbModule;

public static class PhraseGenerator
{
    public static string SanitizeText(string text)
    {
        var sb = new StringBuilder(text);

        sb.Replace('\u2014', '-');
        sb.Replace('\u2013', '-');
        sb.Replace('\u2015', '-');

        sb.Replace('\u2018', '\'');
        sb.Replace('\u2019', '\'');
        sb.Replace('\u201A', '\'');
        sb.Replace('\u201B', '\'');

        sb.Replace('\u201C', '"');
        sb.Replace('\u201D', '"');
        sb.Replace('\u201E', '"');
        sb.Replace('\u201F', '"');

        sb.Replace("\u2026", "...");

        sb.Replace('\u00AB', '"');
        sb.Replace('\u00BB', '"');

        sb.Replace('\u2039', '\'');
        sb.Replace('\u203A', '\'');

        sb.Replace('\u00A0', ' ');
        sb.Replace('\u202F', ' ');
        sb.Replace('\u2009', ' ');

        sb.Replace('\u2010', '-');
        sb.Replace('\u2011', '-');
        sb.Replace('\u2012', '-');

        return sb.ToString();
    }

    public static string GeneratePhrase(string[] wordList, Random rng, int minWordCount = 20, int maxWordCount = 35)
    {
        var words = new List<string>();
        int wordCount = rng.Next(minWordCount, maxWordCount + 1);

        for (int i = 0; i < wordCount; i++)
        {
            string selectedWord;
            int attempts = 0;
            do
            {
                int index = rng.Next(wordList.Length);
                selectedWord = wordList[index];
                attempts++;
            } while (i > 0 && selectedWord == words[i - 1] && attempts < 100);

            words.Add(selectedWord);
        }

        return string.Join(" ", words);
    }

    public static Phrase GeneratePhraseForMode(GameMode mode, Random rng)
    {
        switch (mode)
        {
            case GameMode.English500:
                return new Phrase(SanitizeText(GeneratePhrase(English500Words.Words, rng, 10, 14)));
            case GameMode.Spanish500:
                return new Phrase(SanitizeText(GeneratePhrase(Spanish500Words.Words, rng, 8, 11)));
            case GameMode.French500:
                return new Phrase(SanitizeText(GeneratePhrase(French500Words.Words, rng, 8, 11)));
            case GameMode.German500:
                return new Phrase(SanitizeText(GeneratePhrase(German500Words.Words, rng, 9, 12)));
            case GameMode.Italian500:
                return new Phrase(SanitizeText(GeneratePhrase(Italian500Words.Words, rng, 8, 11)));
            case GameMode.Portuguese500:
                return new Phrase(SanitizeText(GeneratePhrase(Portuguese500Words.Words, rng, 9, 12)));
            case GameMode.Japanese500:
                return new Phrase(SanitizeText(GeneratePhrase(Japanese500Words.Words, rng, 13, 18)));
            case GameMode.Korean500:
                return new Phrase(SanitizeText(GeneratePhrase(Korean500Words.Words, rng, 11, 15)));
            case GameMode.Chinese500:
                return new Phrase(SanitizeText(GeneratePhrase(Chinese500Words.Words, rng, 12, 16)));
            case GameMode.Ukrainian500:
                return new Phrase(SanitizeText(GeneratePhrase(Ukrainian500Words.Words, rng, 8, 11)));
            case GameMode.Arabic500:
                return new Phrase(SanitizeText(GeneratePhrase(Arabic500Words.Words, rng, 7, 10)));
            case GameMode.Hindi500:
                return new Phrase(SanitizeText(GeneratePhrase(Hindi500Words.Words, rng, 7, 9)));
            case GameMode.Dutch500:
                return new Phrase(SanitizeText(GeneratePhrase(Dutch500Words.Words, rng, 9, 13)));
            case GameMode.Swedish500:
                return new Phrase(SanitizeText(GeneratePhrase(Swedish500Words.Words, rng, 10, 14)));
            case GameMode.Turkish500:
                return new Phrase(SanitizeText(GeneratePhrase(Turkish500Words.Words, rng, 8, 10)));
            case GameMode.EnglishQuotes:
            case GameMode.SpanishQuotes:
            case GameMode.FrenchQuotes:
            case GameMode.GermanQuotes:
            case GameMode.ItalianQuotes:
            case GameMode.PortugueseQuotes:
            case GameMode.JapaneseQuotes:
            case GameMode.KoreanQuotes:
            case GameMode.ChineseQuotes:
            case GameMode.UkrainianQuotes:
            case GameMode.ArabicQuotes:
            case GameMode.HindiQuotes:
            case GameMode.DutchQuotes:
            case GameMode.SwedishQuotes:
            case GameMode.TurkishQuotes:
                return QuoteGenerator.GetRandomQuote(mode, rng);
            default:
                return new Phrase(SanitizeText("The quick brown fox jumps over the lazy dog"));
        }
    }
}
