using System;
using System.Linq;

namespace StdbModule;

public static partial class HindiQuotes
{
    public static readonly Quote[] Quotes =
        आचरयरमचनदरशकल.Quotes
        .Concat(जयशकरपरसद.Quotes)
        .Concat(जरजगरयरसन.Quotes)
        .Concat(धरमवरभरत.Quotes)
        .Concat(परमचद.Quotes)
        .Concat(परमचद.Quotes)
        .Concat(भरतनदहरशचदर.Quotes)
        .Concat(मथलशरणगपत.Quotes)
        .Concat(महदववरम.Quotes)
        .Concat(यशपल.Quotes)
        .Concat(रमवलसशरम.Quotes)
        .Concat(रहलसकतययन.Quotes)
        .Concat(वसधडलमय.Quotes)
        .Concat(हजरपरसददववद.Quotes)
        .Concat(हरवशरयबचचन.Quotes)
        .ToArray();
}