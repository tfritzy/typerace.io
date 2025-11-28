using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;
using System.Text.RegularExpressions;

namespace WikiQuote
{
    public class WikiQuoteClient : IDisposable
    {
        private const int MinQuoteLength = 10;
        private const int MaxQuoteLength = 500;
        private const int MinQuoteOfTheDayLength = 20;

        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private bool _disposed;

        public WikiQuoteClient(string language = "en")
        {
            _baseUrl = $"https://{language}.wikiquote.org/w/api.php";
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "WikiQuote-CSharp/1.0");
        }

        public async Task<List<SearchResult>> SearchAsync(string query)
        {
            var url = $"{_baseUrl}?format=json&action=opensearch&search={HttpUtility.UrlEncode(query)}";
            var response = await _httpClient.GetStringAsync(url);
            
            using var doc = JsonDocument.Parse(response);
            var root = doc.RootElement;
            
            var results = new List<SearchResult>();
            if (root.GetArrayLength() >= 2)
            {
                var titles = root[1];
                for (int i = 0; i < titles.GetArrayLength(); i++)
                {
                    results.Add(new SearchResult { Title = titles[i].GetString() ?? "" });
                }
            }
            
            return results;
        }

        public async Task<int?> GetPageIdAsync(string title)
        {
            var url = $"{_baseUrl}?format=json&action=query&titles={HttpUtility.UrlEncode(title)}&redirects=";
            var response = await _httpClient.GetStringAsync(url);
            
            using var doc = JsonDocument.Parse(response);
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

        public async Task<List<string>> GetQuotesAsync(string title)
        {
            var pageId = await GetPageIdAsync(title);
            if (pageId == null)
            {
                throw new ArgumentException($"Page not found: {title}");
            }

            var url = $"{_baseUrl}?format=json&action=parse&pageid={pageId}&prop=text";
            var response = await _httpClient.GetStringAsync(url);
            
            using var doc = JsonDocument.Parse(response);
            var html = doc.RootElement
                .GetProperty("parse")
                .GetProperty("text")
                .GetProperty("*")
                .GetString() ?? "";

            return ParseQuotesFromHtml(html);
        }

        public async Task<string?> GetRandomQuoteAsync()
        {
            var url = $"{_baseUrl}?format=json&action=query&list=random&rnnamespace=0&rnlimit=1";
            var response = await _httpClient.GetStringAsync(url);
            
            using var doc = JsonDocument.Parse(response);
            var randomList = doc.RootElement
                .GetProperty("query")
                .GetProperty("random");
            
            if (randomList.GetArrayLength() > 0)
            {
                var title = randomList[0].GetProperty("title").GetString();
                if (title != null)
                {
                    var quotes = await GetQuotesAsync(title);
                    if (quotes.Count > 0)
                    {
                        return quotes[Random.Shared.Next(quotes.Count)];
                    }
                }
            }
            
            return null;
        }

        public async Task<QuoteOfTheDay?> GetQuoteOfTheDayAsync()
        {
            var url = $"{_baseUrl}?format=json&action=parse&page=Wikiquote:Quote_of_the_day&prop=text";
            
            try
            {
                var response = await _httpClient.GetStringAsync(url);
                using var doc = JsonDocument.Parse(response);
                var html = doc.RootElement
                    .GetProperty("parse")
                    .GetProperty("text")
                    .GetProperty("*")
                    .GetString() ?? "";

                return ParseQuoteOfTheDay(html);
            }
            catch (HttpRequestException)
            {
                return null;
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private List<string> ParseQuotesFromHtml(string html)
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
                    quotes.Add(quote);
                }
            }
            
            return quotes;
        }

        private QuoteOfTheDay? ParseQuoteOfTheDay(string html)
        {
            var tablePattern = new Regex(@"<table[^>]*>.*?</table>", RegexOptions.Singleline);
            var tableMatch = tablePattern.Match(html);
            
            if (tableMatch.Success)
            {
                var tableHtml = tableMatch.Value;
                
                var tdPattern = new Regex(@"<td[^>]*>(?<content>.*?)</td>", RegexOptions.Singleline);
                var tdMatches = tdPattern.Matches(tableHtml);
                
                string? quoteText = null;
                string? author = null;
                
                foreach (Match td in tdMatches)
                {
                    var content = StripHtmlTags(td.Groups["content"].Value);
                    content = CleanQuoteText(content);
                    
                    if (!string.IsNullOrWhiteSpace(content))
                    {
                        if (quoteText == null && content.Length > MinQuoteOfTheDayLength)
                        {
                            quoteText = content;
                        }
                        else if (quoteText != null && author == null && content.Length < quoteText.Length)
                        {
                            author = content;
                        }
                    }
                }
                
                if (quoteText != null)
                {
                    return new QuoteOfTheDay { Quote = quoteText, Author = author };
                }
            }
            
            return null;
        }

        private string StripHtmlTags(string html)
        {
            var tagPattern = new Regex(@"<[^>]+>");
            return tagPattern.Replace(html, "");
        }

        private string CleanQuoteText(string text)
        {
            text = HttpUtility.HtmlDecode(text);
            text = Regex.Replace(text, @"\s+", " ");
            text = text.Trim();
            text = Regex.Replace(text, @"^\[\d+\]", "");
            text = Regex.Replace(text, @"\[\d+\]$", "");
            return text.Trim();
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _httpClient.Dispose();
                }
                _disposed = true;
            }
        }
    }

    public class SearchResult
    {
        public string Title { get; set; } = "";
    }

    public class QuoteOfTheDay
    {
        public string Quote { get; set; } = "";
        public string? Author { get; set; }
    }
}
