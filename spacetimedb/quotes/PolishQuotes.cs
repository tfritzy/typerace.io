using System;
using System.Linq;

namespace StdbModule;

public static partial class PolishQuotes
{
    public static readonly Quote[] Quotes =
        AdamAsnyk.Quotes
        .Concat(AdamMickiewicz.Quotes)
        .Concat(AleksanderFredro.Quotes)
        .Concat(BolesławPrus.Quotes)
        .Concat(BrunoSchulz.Quotes)
        .Concat(CyprianKamilNorwid.Quotes)
        .Concat(CzesławMiłosz.Quotes)
        .Concat(ElizaOrzeszkowa.Quotes)
        .Concat(HenrykSienkiewicz.Quotes)
        .Concat(IgnacyKrasicki.Quotes)
        .Concat(JanKochanowski.Quotes)
        .Concat(JarosławIwaszkiewicz.Quotes)
        .Concat(JerzyAndrzejewski.Quotes)
        .Concat(JulianTuwim.Quotes)
        .Concat(JuliuszSłowacki.Quotes)
        .Concat(JózefIgnacyKraszewski.Quotes)
        .Concat(KonstantyIldefonsGałczyński.Quotes)
        .Concat(KornelUjejski.Quotes)
        .Concat(LeopoldStaff.Quotes)
        .Concat(LeopoldTyrmand.Quotes)
        .Concat(MarekHłasko.Quotes)
        .Concat(MariaDąbrowska.Quotes)
        .Concat(MariaKonopnicka.Quotes)
        .Concat(MikołajRej.Quotes)
        .Concat(OlgaTokarczuk.Quotes)
        .Concat(RyszardKapuściński.Quotes)
        .Concat(StanisławIgnacyWitkiewicz.Quotes)
        .Concat(StanisławJerzyLec.Quotes)
        .Concat(StanisławLem.Quotes)
        .Concat(StefanŻeromski.Quotes)
        .Concat(SławomirMrożek.Quotes)
        .Concat(TadeuszBoyŻeleński.Quotes)
        .Concat(TadeuszKonwicki.Quotes)
        .Concat(TadeuszRóżewicz.Quotes)
        .Concat(WisławaSzymborska.Quotes)
        .Concat(WładysławReymont.Quotes)
        .Concat(ZbigniewHerbert.Quotes)
        .Concat(ZofiaNałkowska.Quotes)
        .Concat(ZygmuntKrasiński.Quotes)
        .ToArray();
}