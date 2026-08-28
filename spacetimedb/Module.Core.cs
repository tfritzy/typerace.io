using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const int MAX_ABANDONED_GAMES = 10;
    private const long PUBLIC_GAME_COUNTDOWN_MICROSECONDS = 4_000_000;
    private const long PRIVATE_GAME_COUNTDOWN_MICROSECONDS = 6_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_MICROSECONDS = 4_000_000;
    private const long BOT_FILL_DELAY_MICROSECONDS = 5_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_START_DELAY_MICROSECONDS = 1_000_000;
    private const long BOT_RECOGNITION_DELAY_MIN_MICROSECONDS = 100_000;
    private const long BOT_RECOGNITION_DELAY_RANGE_MICROSECONDS = 300_000;
    private const long BOT_HESITATION_DELAY_MIN_MICROSECONDS = 400_000;
    private const long BOT_HESITATION_DELAY_RANGE_MICROSECONDS = 600_000;
    private const long BOT_MIN_KEYSTROKE_DELAY_MICROSECONDS = 50_000;
    private const double BOT_BURST_PROBABILITY = 0.10;
    private const double BOT_HESITATION_PROBABILITY = 0.04;
    private const double BOT_BURST_SPEED_MULTIPLIER = 0.65;
    private const double BOT_BACKSPACE_SPEED_MULTIPLIER = 0.6;
    private const double BOT_RECOVERY_DELAY_MIN_MULTIPLIER = 0.5;
    private const double BOT_RECOVERY_DELAY_RANGE_MULTIPLIER = 0.5;


    private static double GetLanguageTypingSpeedModifier(GameMode mode)
    {
        switch (mode)
        {
            case GameMode.English500:
            case GameMode.EnglishQuotes:
                return 1.0;
            case GameMode.Spanish500:
            case GameMode.SpanishQuotes:
                return 40.0 / 35.0;
            case GameMode.French500:
            case GameMode.FrenchQuotes:
                return 40.0 / 35.0;
            case GameMode.German500:
            case GameMode.GermanQuotes:
                return 40.0 / 35.0;
            case GameMode.Italian500:
            case GameMode.ItalianQuotes:
                return 40.0 / 35.0;
            case GameMode.Portuguese500:
            case GameMode.PortugueseQuotes:
                return 40.0 / 35.0;
            case GameMode.Japanese500:
            case GameMode.JapaneseQuotes:
                return 40.0 / 30.0 * 5.0;
            case GameMode.Korean500:
            case GameMode.KoreanQuotes:
                return 40.0 / 25.0 * 5.0;
            case GameMode.Chinese500:
            case GameMode.ChineseQuotes:
                return 40.0 / 20.0 * 5.0;
            case GameMode.Ukrainian500:
            case GameMode.UkrainianQuotes:
                return 40.0 / 30.0;
            case GameMode.Arabic500:
            case GameMode.ArabicQuotes:
                return 40.0 / 25.0;
            case GameMode.Hindi500:
            case GameMode.HindiQuotes:
                return 40.0 / 25.0;
            case GameMode.Dutch500:
            case GameMode.DutchQuotes:
                return 40.0 / 38.0;
            case GameMode.Swedish500:
            case GameMode.SwedishQuotes:
                return 40.0 / 38.0;
            case GameMode.Turkish500:
            case GameMode.TurkishQuotes:
                return 40.0 / 32.0;
            case GameMode.Russian500:
            case GameMode.RussianQuotes:
                return 40.0 / 30.0;
            case GameMode.Romanian500:
            case GameMode.RomanianQuotes:
                return 40.0 / 35.0;
            case GameMode.Indonesian500:
            case GameMode.IndonesianQuotes:
                return 40.0 / 35.0;
            case GameMode.Polish500:
            case GameMode.PolishQuotes:
                return 40.0 / 35.0;
            case GameMode.Czech500:
            case GameMode.CzechQuotes:
                return 40.0 / 32.0;
            default:
                return 1.0;
        }
    }
}
