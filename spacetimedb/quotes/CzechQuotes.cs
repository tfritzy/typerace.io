using System.Linq;

namespace StdbModule;

public static partial class CzechQuotes
{
    public static readonly Quote[] Quotes =
        PavelKosorin.Quotes
        .Concat(JanWerich.Quotes)
        .Concat(TomášGarrigueMasaryk.Quotes)
        .Concat(JanAmosKomenský.Quotes)
        .Concat(KarelČapek.Quotes)
        .Concat(VáclavHavel.Quotes)
        .Concat(JanHus.Quotes)
        .Concat(MilanKundera.Quotes)
        .Concat(FranzKafka.Quotes)
        .Concat(KarelHavlíčekBorovský.Quotes)
        .Concat(JaroslavSeifert.Quotes)
        .Concat(BoženaNěmcová.Quotes)
        .Concat(OscarWilde.Quotes)
        .ToArray();
}
