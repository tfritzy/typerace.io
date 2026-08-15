using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace StdbModule;

public static class PhraseGenerator
{
    private static readonly int[] RandomWordCounts = [8, 12, 16, 20];

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

    private static Phrase GenerateRandomWords(
        string[] wordList,
        Random rng,
        bool noSpaces = false)
    {
        var words = new List<string>();
        int wordCount = RandomWordCounts[rng.Next(RandomWordCounts.Length)];

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

        var delimiter = noSpaces ? "" : " ";
        var text = SanitizeText(string.Join(delimiter, words));
        return new Phrase(text, wordCount: wordCount);
    }

    public static Phrase GeneratePhraseForMode(GameMode mode, Random rng)
    {
        switch (mode)
        {
            case GameMode.English500:
                return GenerateRandomWords(English500Words.Words, rng);
            case GameMode.Spanish500:
                return GenerateRandomWords(Spanish500Words.Words, rng);
            case GameMode.French500:
                return GenerateRandomWords(French500Words.Words, rng);
            case GameMode.German500:
                return GenerateRandomWords(German500Words.Words, rng);
            case GameMode.Italian500:
                return GenerateRandomWords(Italian500Words.Words, rng);
            case GameMode.Portuguese500:
                return GenerateRandomWords(Portuguese500Words.Words, rng);
            case GameMode.Japanese500:
                return GenerateRandomWords(Japanese500Words.Words, rng, noSpaces: true);
            case GameMode.Korean500:
                return GenerateRandomWords(Korean500Words.Words, rng);
            case GameMode.Chinese500:
                return GenerateRandomWords(Chinese500Words.Words, rng, noSpaces: true);
            case GameMode.Ukrainian500:
                return GenerateRandomWords(Ukrainian500Words.Words, rng);
            case GameMode.Arabic500:
                return GenerateRandomWords(Arabic500Words.Words, rng);
            case GameMode.Hindi500:
                return GenerateRandomWords(Hindi500Words.Words, rng);
            case GameMode.Dutch500:
                return GenerateRandomWords(Dutch500Words.Words, rng);
            case GameMode.Swedish500:
                return GenerateRandomWords(Swedish500Words.Words, rng);
            case GameMode.Turkish500:
                return GenerateRandomWords(Turkish500Words.Words, rng);
            case GameMode.Russian500:
                return GenerateRandomWords(Russian500Words.Words, rng);
            case GameMode.Romanian500:
                return GenerateRandomWords(Romanian500Words.Words, rng);
            case GameMode.Indonesian500:
                return GenerateRandomWords(Indonesian500Words.Words, rng);
            case GameMode.Polish500:
                return GenerateRandomWords(Polish500Words.Words, rng);
            case GameMode.Czech500:
                return GenerateRandomWords(Czech500Words.Words, rng);
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
            case GameMode.RussianQuotes:
            case GameMode.RomanianQuotes:
            case GameMode.IndonesianQuotes:
            case GameMode.PolishQuotes:
            case GameMode.CzechQuotes:
                return QuoteGenerator.GetRandomQuote(mode, rng);
            default:
                return new Phrase(SanitizeText("The quick brown fox jumps over the lazy dog"));
        }
    }
}
