using System.Linq;

namespace StdbModule;

public static partial class RomanianQuotes
{
    public static readonly Quote[] Quotes =
        AlexandruVlahuță.Quotes
        .Concat(AndreiPleșu.Quotes)
        .Concat(ConstantinBrâncuși.Quotes)
        .Concat(EmilCioran.Quotes)
        .Concat(GeorgeTopîrceanu.Quotes)
        .Concat(GrigoreMoisil.Quotes)
        .Concat(IonLucaCaragiale.Quotes)
        .Concat(LucianBlaga.Quotes)
        .Concat(MarinPreda.Quotes)
        .Concat(MihaiEminescu.Quotes)
        .Concat(MirceaEliade.Quotes)
        .Concat(NichitaStănescu.Quotes)
        .Concat(NicolaeIorga.Quotes)
        .Concat(OctavianPaler.Quotes)
        .Concat(TudorMușatescu.Quotes)
        .ToArray();
}
