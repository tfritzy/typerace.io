using System;
using System.Linq;


namespace StdbModule;
public static partial class HindiQuotes
{
    public static readonly Quote[] Quotes = 
        परमचद.Quotes
        .Concat(हरवशरयबचचन.Quotes)
        .Concat(महदववरम.Quotes)
        .Concat(जयशकरपरसद.Quotes)
        .Concat(मथलशरणगपत.Quotes)
        .Concat(भरतदहरशचदर.Quotes)
        .Concat(धरमवरभरत.Quotes)
        .Concat(यशपल.Quotes)
        .Concat(हजरपरसददववद.Quotes)
        .Concat(रमवलसशरम.Quotes)
        .Concat(रहलसकतययन.Quotes)
        .ToArray();
}