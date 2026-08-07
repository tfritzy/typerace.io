using System.Linq;

namespace StdbModule;

public static partial class PolishQuotes
{
    public static readonly Quote[] Quotes =
        StanisławJerzyLec.Quotes
        .Concat(RyszardKapuściński.Quotes)
        .Concat(OlgaTokarczuk.Quotes)
        .Concat(WisławaSzymborska.Quotes)
        .Concat(StanisławLem.Quotes)
        .Concat(SławomirMrożek.Quotes)
        .ToArray();
}
