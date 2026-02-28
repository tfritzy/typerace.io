public struct Phrase
{
    public readonly string Text;
    public readonly string? Attribution;

    public Phrase(string text, string? attribution = null)
    {
        Text = text;
        Attribution = attribution;
    }
}

public struct Snippet
{
    public string Text;
    public string Source;
}
