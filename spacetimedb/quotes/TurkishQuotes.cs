using System;
using System.Linq;


namespace StdbModule;
public static partial class TurkishQuotes
{
    public static readonly Quote[] Quotes = 
        OrhanPamuk.Quotes
        .Concat(YaşarKemal.Quotes)
        .Concat(ElifŞafak.Quotes)
        .Concat(AhmetHamdiTanpınar.Quotes)
        .Concat(SaitFaikAbasıyanık.Quotes)
        .Concat(OğuzAtay.Quotes)
        .Concat(CemalSüreya.Quotes)
        .Concat(TurgutUyar.Quotes)
        .Concat(EdipCansever.Quotes)
        .Concat(OktayRifat.Quotes)
        .Concat(MelihCevdetAnday.Quotes)
        .Concat(OrhanVeliKanık.Quotes)
        .Concat(FazılHüsnüDağlarca.Quotes)
        .Concat(CahitSıtkıTarancı.Quotes)
        .Concat(NecipFazılKısakürek.Quotes)
        .Concat(TevfikFikret.Quotes)
        .Concat(MehmetAkifErsoy.Quotes)
        .Concat(YahyaKemalBeyatlı.Quotes)
        .Concat(HalideEdibAdıvar.Quotes)
        .Concat(ReşatNuriGüntekin.Quotes)
        .Concat(HaldunTaner.Quotes)
        .Concat(AzizNesin.Quotes)
        .Concat(RıfatIlgaz.Quotes)
        .Concat(SabahattinAli.Quotes)
        .Concat(PeyamiSafa.Quotes)
        .Concat(YakupKadriKaraosmanoğlu.Quotes)
        .Concat(ÖmerSeyfettin.Quotes)
        .Concat(ZiyaGökalp.Quotes)
        .Concat(NamıkKemal.Quotes)
        .Concat(AbdülhakHamitTarhan.Quotes)
        .Concat(Nedim.Quotes)
        .Concat(Fuzûlî.Quotes)
        .Concat(YunusEmre.Quotes)
        .ToArray();
}