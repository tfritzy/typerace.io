using SpacetimeDB;
using System;
using System.Collections.Generic;
using System.Linq;

public static class WpmCalculator
{
    private const int CharsPerWord = 5;

    public static double GetWpm(int charCount, double timeSeconds)
    {
        if (timeSeconds <= 0)
        {
            return 0;
        }

        return (charCount / (double)CharsPerWord) / (timeSeconds / 60.0);
    }

    public static List<double> GetRawWpmBySecond(List<CharacterEvent> events, long raceStartTimestamp)
    {
        if (events == null || events.Count == 0)
        {
            return new List<double>();
        }

        var charCountBySecond = new List<int>();
        var wpmBySecond = new List<double>();

        foreach (var evt in events)
        {
            if (evt.EventType == CharacterEventType.Backspace)
            {
                continue;
            }

            var elapsedMicros = evt.Timestamp - raceStartTimestamp;
            var second = (int)(elapsedMicros / 1_000_000);

            if (second < 0)
            {
                continue;
            }

            while (charCountBySecond.Count <= second)
            {
                charCountBySecond.Add(0);
                wpmBySecond.Add(0);
            }

            charCountBySecond[second]++;
        }

        for (int i = 0; i < wpmBySecond.Count; i++)
        {
            if (charCountBySecond[i] == 0)
            {
                wpmBySecond[i] = 0;
                continue;
            }

            wpmBySecond[i] = GetWpm(charCountBySecond[i], 1);
        }

        var smoothedWpm = new List<double>(wpmBySecond);
        for (int i = 2; i < wpmBySecond.Count; i++)
        {
            smoothedWpm[i] = (wpmBySecond[i - 2] + wpmBySecond[i - 1] + wpmBySecond[i]) / 3.0;
        }

        return smoothedWpm;
    }

    public static List<double> GetAggWpmBySecond(List<CharacterEvent> events, long raceStartTimestamp)
    {
        if (events == null || events.Count == 0)
        {
            return new List<double>();
        }

        var progressionStack = new List<double>();
        foreach (var evt in events)
        {
            var elapsedMicros = evt.Timestamp - raceStartTimestamp;
            var seconds = elapsedMicros / 1_000_000.0;

            if (evt.EventType == CharacterEventType.Backspace)
            {
                if (progressionStack.Count > 0)
                {
                    progressionStack.RemoveAt(progressionStack.Count - 1);
                }
            }
            else
            {
                progressionStack.Add(seconds);
            }
        }

        if (progressionStack.Count == 0)
        {
            return new List<double>();
        }

        var aggWpmByCharacter = new List<double>();
        for (int i = 0; i < progressionStack.Count; i++)
        {
            aggWpmByCharacter.Add(GetWpm(i + 1, progressionStack[i]));
        }

        int target = 1;
        var nearestIndexPriorWpmToSecondBounds = new List<int>();
        for (int i = 0; i < aggWpmByCharacter.Count; i++)
        {
            while (progressionStack[i] > target)
            {
                target += 1;
                nearestIndexPriorWpmToSecondBounds.Add(Math.Max(i - 1, 0));
            }
        }

        var wpmBySecond = new List<double>();
        for (int i = 0; i < nearestIndexPriorWpmToSecondBounds.Count; i++)
        {
            var second = i + 1;
            var priorI = nearestIndexPriorWpmToSecondBounds[i];
            var prevVal = aggWpmByCharacter[priorI];
            
            var nextI = priorI + 1;
            if (nextI >= aggWpmByCharacter.Count)
            {
                wpmBySecond.Add(prevVal);
                continue;
            }

            var nextVal = aggWpmByCharacter[nextI];
            var priorTime = progressionStack[priorI];
            var nextTime = progressionStack[nextI];
            var timespan = nextTime - priorTime;

            if (timespan <= 0)
            {
                wpmBySecond.Add(prevVal);
                continue;
            }

            var percentAlongTimespan = (second - priorTime) / timespan;
            var lerpedWpm = prevVal + (nextVal - prevVal) * percentAlongTimespan;
            lerpedWpm = Math.Max(lerpedWpm, 0);
            wpmBySecond.Add(lerpedWpm);
        }

        if (aggWpmByCharacter.Count > 0)
        {
            var finalWpm = aggWpmByCharacter[aggWpmByCharacter.Count - 1];
            wpmBySecond.Add(finalWpm);
        }

        return wpmBySecond;
    }
}
