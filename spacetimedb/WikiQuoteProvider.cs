using System;
using System.Collections.Generic;

public static class WikiQuoteProvider
{
    private static readonly string[] Quotes = new[]
    {
        "The only thing we have to fear is fear itself.",
        "In the middle of difficulty lies opportunity.",
        "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        "The way to get started is to quit talking and begin doing.",
        "Life is what happens when you're busy making other plans.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "It is during our darkest moments that we must focus to see the light.",
        "The only impossible journey is the one you never begin.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Believe you can and you're halfway there.",
        "The best time to plant a tree was twenty years ago. The second best time is now.",
        "Your time is limited, don't waste it living someone else's life.",
        "If life were predictable it would cease to be life, and be without flavor.",
        "In the end, it's not the years in your life that count. It's the life in your years.",
        "Life is a succession of lessons which must be lived to be understood.",
        "You will face many defeats in life, but never let yourself be defeated.",
        "The greatest wealth is to live content with little.",
        "Never let the fear of striking out keep you from playing the game.",
        "Life is either a daring adventure or nothing at all.",
        "Many of life's failures are people who did not realize how close they were to success when they gave up.",
        "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.",
        "Life is made of ever so many partings welded together.",
        "To live is the rarest thing in the world. Most people exist, that is all.",
        "Life itself is the most wonderful fairy tale.",
        "Do not let making a living prevent you from making a life.",
        "Life is ours to be spent, not to be saved.",
        "Keep smiling, because life is a beautiful thing and there's so much to smile about.",
        "Life is a long lesson in humility.",
        "In three words I can sum up everything I've learned about life: it goes on.",
        "Love the life you live. Live the life you love.",
        "Life is trying things to see if they work.",
        "Life is ten percent what happens to you and ninety percent how you respond to it.",
        "An unexamined life is not worth living.",
        "Turn your wounds into wisdom.",
        "The only way to do great work is to love what you do.",
        "If you look at what you have in life, you'll always have more.",
        "The mind is everything. What you think you become.",
        "Strive not to be a success, but rather to be of value.",
        "I have not failed. I've just found ten thousand ways that won't work.",
        "The only true wisdom is in knowing you know nothing.",
        "The purpose of our lives is to be happy.",
        "Get busy living or get busy dying.",
        "You only live once, but if you do it right, once is enough.",
        "Many people die at twenty five and aren't buried until they are seventy five.",
        "Money and success don't change people; they merely amplify what is already there.",
        "Not how long, but how well you have lived is the main thing.",
        "I find that the harder I work, the more luck I seem to have.",
        "The way I see it, if you want the rainbow, you gotta put up with the rain.",
        "All our dreams can come true, if we have the courage to pursue them.",
        "It is never too late to be what you might have been."
    };

    public static string GetRandomQuote(Random rng)
    {
        return Quotes[rng.Next(Quotes.Length)];
    }

    public static string GeneratePhrase(Random rng, int minLength = 100, int maxLength = 200)
    {
        var result = new List<string>();
        var targetLength = rng.Next(minLength, maxLength + 1);

        while (true)
        {
            var quote = GetRandomQuote(rng);
            result.Add(quote);

            var joinedLength = string.Join(" ", result).Length;
            if (joinedLength >= targetLength)
            {
                break;
            }
        }

        return string.Join(" ", result);
    }
}
