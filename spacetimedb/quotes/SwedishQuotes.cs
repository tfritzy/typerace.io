using System;
using System.Linq;

namespace StdbModule;

public static partial class SwedishQuotes
{
    public static readonly Quote[] Quotes =
        AstridLindgren.Quotes
        .Concat(AugustStrindberg.Quotes)
        .Concat(DanAndersson.Quotes)
        .Concat(EdithSödergran.Quotes)
        .Concat(ErikAxelKarlfeldt.Quotes)
        .Concat(EyvindJohnson.Quotes)
        .Concat(GunnarEkelöf.Quotes)
        .Concat(GustafFröding.Quotes)
        .Concat(HarryMartinson.Quotes)
        .Concat(HenningMankell.Quotes)
        .Concat(HjalmarSöderberg.Quotes)
        .Concat(IvarLoJohansson.Quotes)
        .Concat(JanGuillou.Quotes)
        .Concat(JonasGardell.Quotes)
        .Concat(PerOlovEnquist.Quotes)
        .Concat(SaraLidman.Quotes)
        .Concat(SelmaLagerlöf.Quotes)
        .Concat(StigDagerman.Quotes)
        .Concat(TomasTranströmer.Quotes)
        .Concat(TorgnyLindgren.Quotes)
        .Concat(VernervonHeidenstam.Quotes)
        .Concat(VilhelmMoberg.Quotes)
        .ToArray();
}