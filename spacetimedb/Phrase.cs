public struct Phrase
{
    public string Text;
    public string? Attribution;

    public Phrase(string text, string? attribution = null)
    {
        Text = text;
        Attribution = attribution;
    }
}
