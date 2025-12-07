using System;
using System.Linq;

namespace StdbModule;

public static partial class TurkishQuotes
{
    public static readonly Quote[] Quotes =
        AbdülhakHamitTarhan.Quotes
        .Concat(AhmetHamdiTanpınar.Quotes)
        .Concat(AzizNesin.Quotes)
        .Concat(CahitSıtkıTarancı.Quotes)
        .Concat(CemalSüreya.Quotes)
        .Concat(EdipCansever.Quotes)
        .Concat(ElifŞafak.Quotes)
        .Concat(FazılHüsnüDağlarca.Quotes)
        .Concat(Fuzûlî.Quotes)
        .Concat(HaldunTaner.Quotes)
        .Concat(HalideEdibAdıvar.Quotes)
        .Concat(MehmetAkifErsoy.Quotes)
        .Concat(MelihCevdetAnday.Quotes)
        .Concat(NamıkKemal.Quotes)
        .Concat(NecipFazılKısakürek.Quotes)
        .Concat(Nedim.Quotes)
        .Concat(OktayRifat.Quotes)
        .Concat(OrhanPamuk.Quotes)
        .Concat(OrhanVeliKanık.Quotes)
        .Concat(OğuzAtay.Quotes)
        .Concat(PeyamiSafa.Quotes)
        .Concat(ReşatNuriGüntekin.Quotes)
        .Concat(RıfatIlgaz.Quotes)
        .Concat(SabahattinAli.Quotes)
        .Concat(SaitFaikAbasıyanık.Quotes)
        .Concat(TevfikFikret.Quotes)
        .Concat(TurgutUyar.Quotes)
        .Concat(YahyaKemalBeyatlı.Quotes)
        .Concat(YakupKadriKaraosmanoğlu.Quotes)
        .Concat(YaşarKemal.Quotes)
        .Concat(YunusEmre.Quotes)
        .Concat(ZiyaGökalp.Quotes)
        .ToArray();
}