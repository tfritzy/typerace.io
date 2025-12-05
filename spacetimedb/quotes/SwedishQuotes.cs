using System;
using System.Linq;


namespace StdbModule;
public static partial class SwedishQuotes
{
    public static readonly Quote[] Quotes = 
        AstridLindgren.Quotes
        .Concat(AugustStrindberg.Quotes)
        .Concat(SelmaLagerlöf.Quotes)
        .Concat(TomasTranströmer.Quotes)
        .Concat(HenningMankell.Quotes)
        .Concat(HjalmarSöderberg.Quotes)
        .Concat(VilhelmMoberg.Quotes)
        .Concat(KarinBoye.Quotes)
        .Concat(HarryMartinson.Quotes)
        .Concat(EyvindJohnson.Quotes)
        .Concat(WernerAspenström.Quotes)
        .Concat(ErikAxelKarlfeldt.Quotes)
        .Concat(VernervonHeidenstam.Quotes)
        .Concat(GustafFröding.Quotes)
        .Concat(DanAndersson.Quotes)
        .Concat(EdithSödergran.Quotes)
        .Concat(GunnarEkelöf.Quotes)
        .Concat(StigDagerman.Quotes)
        .Concat(SaraLidman.Quotes)
        .Concat(PerOlovEnquist.Quotes)
        .Concat(TorgnyLindgren.Quotes)
        .Concat(IvarLoJohansson.Quotes)
        .Concat(MoaMartinson.Quotes)
        .Concat(JanGuillou.Quotes)
        .Concat(JonasGardell.Quotes)
        .Concat(KatarinaMazetti.Quotes)
        .ToArray();
}