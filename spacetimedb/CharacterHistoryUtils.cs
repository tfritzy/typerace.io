namespace StdbModule;

public static class CharacterHistoryUtils
{
    private const int EventSizeBytes = 3;
    private const ushort MaxDeciseconds = ushort.MaxValue;

    public static void Append(
        ref byte[] history,
        long gameStartMicros,
        long eventMicros,
        CharacterEventType eventType)
    {
        var eventBytes = Encode(gameStartMicros, eventMicros, eventType);
        var newHistory = new byte[history.Length + EventSizeBytes];
        Array.Copy(history, newHistory, history.Length);
        Array.Copy(eventBytes, 0, newHistory, history.Length, EventSizeBytes);
        history = newHistory;
    }

    public static double CalculateAccuracy(byte[] history)
    {
        var totalKeystrokes = history.Length / EventSizeBytes;
        if (totalKeystrokes == 0)
        {
            return 0;
        }

        var correctKeystrokes = CountEventsByType(history, CharacterEventType.Correct);
        return (double)correctKeystrokes / totalKeystrokes * 100;
    }

    private static byte[] Encode(
        long gameStartMicros,
        long eventMicros,
        CharacterEventType eventType)
    {
        var elapsedMicros = eventMicros - gameStartMicros;
        var deciseconds = (ushort)Math.Min(elapsedMicros / 100_000, MaxDeciseconds);

        return
        [
            (byte)(deciseconds & 0xFF),
            (byte)((deciseconds >> 8) & 0xFF),
            (byte)eventType
        ];
    }

    private static int CountEventsByType(byte[] history, CharacterEventType eventType)
    {
        var count = 0;
        for (var i = 0; i <= history.Length - EventSizeBytes; i += EventSizeBytes)
        {
            var type = (CharacterEventType)history[i + 2];
            if (type == eventType)
            {
                count++;
            }
        }

        return count;
    }
}
