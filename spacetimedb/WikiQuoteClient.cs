using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Web;
using SpacetimeDB;

public static class WikiQuoteClient
{
    private const string BaseUrl = "https://en.wikiquote.org/w/api.php";
    private const int MinQuoteLength = 50;
    private const int MaxQuoteLength = 300;

    public static string? GetRandomQuote(Random rng)
    {
        var title = GetRandomPageTitle();
        if (title == null)
        {
            return null;
        }

        var quotes = GetQuotesForTitle(title);
        if (quotes.Count == 0)
        {
            return null;
        }

        return quotes[rng.Next(quotes.Count)];
    }

    public static string? GetRandomPageTitle()
    {
        var url = $"{BaseUrl}?format=json&action=query&list=random&rnnamespace=0&rnlimit=1";
        var (response, body) = SpacetimeHttp.HttpGetWithBody(url);

        if (response == null || response.Value.Code != 200)
        {
            Log.Error($"Failed to get random page: {response?.Code}");
            return null;
        }

        var json = Encoding.UTF8.GetString(body);
        using var doc = JsonDocument.Parse(json);
        var randomList = doc.RootElement
            .GetProperty("query")
            .GetProperty("random");

        if (randomList.GetArrayLength() > 0)
        {
            return randomList[0].GetProperty("title").GetString();
        }

        return null;
    }

    public static int? GetPageId(string title)
    {
        var url = $"{BaseUrl}?format=json&action=query&titles={HttpUtility.UrlEncode(title)}&redirects=";
        var (response, body) = SpacetimeHttp.HttpGetWithBody(url);

        if (response == null || response.Value.Code != 200)
        {
            return null;
        }

        var json = Encoding.UTF8.GetString(body);
        using var doc = JsonDocument.Parse(json);
        var pages = doc.RootElement.GetProperty("query").GetProperty("pages");

        foreach (var page in pages.EnumerateObject())
        {
            if (page.Value.TryGetProperty("pageid", out var pageId))
            {
                return pageId.GetInt32();
            }
        }

        return null;
    }

    public static List<string> GetQuotesForTitle(string title)
    {
        var pageId = GetPageId(title);
        if (pageId == null)
        {
            return new List<string>();
        }

        var url = $"{BaseUrl}?format=json&action=parse&pageid={pageId}&prop=text";
        var (response, body) = SpacetimeHttp.HttpGetWithBody(url);

        if (response == null || response.Value.Code != 200)
        {
            return new List<string>();
        }

        var json = Encoding.UTF8.GetString(body);
        using var doc = JsonDocument.Parse(json);
        var html = doc.RootElement
            .GetProperty("parse")
            .GetProperty("text")
            .GetProperty("*")
            .GetString() ?? "";

        return ParseQuotesFromHtml(html);
    }

    private static List<string> ParseQuotesFromHtml(string html)
    {
        var quotes = new List<string>();

        var liPattern = new Regex(@"<li[^>]*>(?<content>.*?)</li>", RegexOptions.Singleline);
        var matches = liPattern.Matches(html);

        foreach (Match match in matches)
        {
            var content = match.Groups["content"].Value;

            if (content.Contains("<ul") || content.Contains("<dl"))
            {
                continue;
            }

            var quote = StripHtmlTags(content);
            quote = CleanQuoteText(quote);

            if (!string.IsNullOrWhiteSpace(quote) && quote.Length > MinQuoteLength && quote.Length < MaxQuoteLength)
            {
                if (IsValidQuote(quote))
                {
                    quotes.Add(quote);
                }
            }
        }

        return quotes;
    }

    private static bool IsValidQuote(string quote)
    {
        if (quote.Contains("Retrieved from") || 
            quote.Contains("Categories:") || 
            quote.Contains("edit source") ||
            quote.Contains("Wikipedia") ||
            quote.Contains("See also") ||
            quote.Contains("External links") ||
            quote.StartsWith("[") ||
            quote.Contains("http://") ||
            quote.Contains("https://"))
        {
            return false;
        }

        var wordCount = quote.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        return wordCount >= 5;
    }

    private static string StripHtmlTags(string html)
    {
        var tagPattern = new Regex(@"<[^>]+>");
        return tagPattern.Replace(html, "");
    }

    private static string CleanQuoteText(string text)
    {
        text = HttpUtility.HtmlDecode(text);
        text = Regex.Replace(text, @"\s+", " ");
        text = text.Trim();
        text = Regex.Replace(text, @"^\[\d+\]", "");
        text = Regex.Replace(text, @"\[\d+\]$", "");
        text = Regex.Replace(text, @"\[\d+\]", "");
        return text.Trim();
    }
}
