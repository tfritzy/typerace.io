using WikiQuote;

Console.WriteLine("WikiQuote C# Client Example");
Console.WriteLine("===========================\n");

using var client = new WikiQuoteClient();

Console.WriteLine("1. Searching for 'Albert Einstein'...");
var searchResults = await client.SearchAsync("Albert Einstein");
Console.WriteLine($"   Found {searchResults.Count} results:");
foreach (var result in searchResults.Take(5))
{
    Console.WriteLine($"   - {result.Title}");
}

Console.WriteLine("\n2. Getting quotes for 'Albert Einstein'...");
try
{
    var quotes = await client.GetQuotesAsync("Albert Einstein");
    Console.WriteLine($"   Found {quotes.Count} quotes:");
    foreach (var quote in quotes.Take(3))
    {
        Console.WriteLine($"   - \"{quote}\"");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"   Error: {ex.Message}");
}

Console.WriteLine("\n3. Getting a random quote...");
try
{
    var randomQuote = await client.GetRandomQuoteAsync();
    if (randomQuote != null)
    {
        Console.WriteLine($"   \"{randomQuote}\"");
    }
    else
    {
        Console.WriteLine("   Could not get a random quote.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"   Error: {ex.Message}");
}

Console.WriteLine("\n4. Getting Quote of the Day...");
try
{
    var qotd = await client.GetQuoteOfTheDayAsync();
    if (qotd != null)
    {
        Console.WriteLine($"   \"{qotd.Quote}\"");
        if (qotd.Author != null)
        {
            Console.WriteLine($"   - {qotd.Author}");
        }
    }
    else
    {
        Console.WriteLine("   Could not get quote of the day.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"   Error: {ex.Message}");
}

Console.WriteLine("\nDone!");
