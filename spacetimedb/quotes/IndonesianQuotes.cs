using System.Linq;

namespace StdbModule;

public static partial class IndonesianQuotes
{
    public static readonly Quote[] Quotes =
        NajwaShihab.Quotes
        .Concat(FiersaBesari.Quotes)
        .Concat(PramoedyaAnantaToer.Quotes)
        .Concat(Kartini.Quotes)
        .Concat(DewiLestari.Quotes)
        .Concat(MayaAngelou.Quotes)
        .Concat(ToniMorrison.Quotes)
        .Concat(AlbertCamus.Quotes)
        .Concat(Soekarno.Quotes)
        .Concat(KiHadjarDewantara.Quotes)
        .Concat(AbdurrahmanWahid.Quotes)
        .Concat(MohammadHatta.Quotes)
        .Concat(Hamka.Quotes)
        .Concat(TanMalaka.Quotes)
        .Concat(NurcholishMadjid.Quotes)
        .Concat(GoenawanMohamad.Quotes)
        .Concat(AniesBaswedan.Quotes)
        .ToArray();
}
