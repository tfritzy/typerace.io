using System;
using System.Linq;


namespace StdbModule;
public static partial class PolishQuotes
{
    public static readonly Quote[] Quotes = 
        AdamMickiewicz.Quotes
        .Concat(WisławaSzymborska.Quotes)
        .Concat(CzesławMiłosz.Quotes)
        .Concat(StanisławLem.Quotes)
        .Concat(HenrykSienkiewicz.Quotes)
        .Concat(BrunoSchulz.Quotes)
        .Concat(JuliuszSłowacki.Quotes)
        .Concat(ZygmuntKrasiński.Quotes)
        .Concat(CyprianKamilNorwid.Quotes)
        .Concat(BolesławPrus.Quotes)
        .Concat(ElizaOrzeszkowa.Quotes)
        .Concat(MariaKonopnicka.Quotes)
        .Concat(StefanŻeromski.Quotes)
        .Concat(WładysławReymont.Quotes)
        .Concat(ZofiaNałkowska.Quotes)
        .Concat(JarosławIwaszkiewicz.Quotes)
        .Concat(JulianTuwim.Quotes)
        .Concat(LeopoldStaff.Quotes)
        .Concat(JanKochanowski.Quotes)
        .Concat(MikołajRej.Quotes)
        .Concat(IgnacyKrasicki.Quotes)
        .Concat(JanPotocki.Quotes)
        .Concat(AleksanderFredro.Quotes)
        .Concat(JózefIgnacyKraszewski.Quotes)
        .Concat(KornelUjejski.Quotes)
        .Concat(AdamAsnyk.Quotes)
        .Concat(MariaDąbrowska.Quotes)
        .Concat(StanisławIgnacyWitkiewicz.Quotes)
        .Concat(TadeuszBoyŻeleński.Quotes)
        .Concat(KonstantyIldefonsGałczyński.Quotes)
        .Concat(TadeuszRóżewicz.Quotes)
        .Concat(ZbigniewHerbert.Quotes)
        .Concat(SławomirMrożek.Quotes)
        .Concat(RyszardKapuściński.Quotes)
        .Concat(MarekHłasko.Quotes)
        .Concat(TadeuszKonwicki.Quotes)
        .Concat(JerzyAndrzejewski.Quotes)
        .Concat(LeopoldTyrmand.Quotes)
        .Concat(StanisławJerzyLec.Quotes)
        .Concat(OlgaTokarczuk.Quotes)
        .ToArray();
}