public struct Phrase
{
    public readonly string Text;
    public readonly string? Attribution;
    public readonly int? WordCount;

    public Phrase(string text, string? attribution = null, int? wordCount = null)
    {
        Text = text;
        Attribution = attribution;
        WordCount = wordCount;
    }
}
