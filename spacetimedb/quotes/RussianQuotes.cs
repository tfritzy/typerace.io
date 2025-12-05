using System;
using System.Linq;


namespace StdbModule;
public static partial class RussianQuotes
{
    public static readonly Quote[] Quotes = 
        ЛевТолстой.Quotes
        .Concat(АлександрПушкин.Quotes)
        .Concat(МихаилБулгаков.Quotes)
        .Concat(МаксимГорький.Quotes)
        .Concat(ОсипМандельштам.Quotes)
        .Concat(ИосифБродский.Quotes)
        .Concat(АфанасийФет.Quotes)
        .Concat(НиколайЛесков.Quotes)
        .Concat(АндрейБелый.Quotes)
        .Concat(КонстантинБальмонт.Quotes)
        .Concat(ВелимирХлебников.Quotes)
        .Concat(ИльяИльф.Quotes)
        .Concat(МихаилЗощенко.Quotes)
        .Concat(АндрейПлатонов.Quotes)
        .Concat(КонстантинПаустовский.Quotes)
        .Concat(АлександрСолженицын.Quotes)
        .Concat(ВикторАстафьев.Quotes)
        .Concat(ВалентинРаспутин.Quotes)
        .Concat(ЛюдмилаУлицкая.Quotes)
        .Concat(БорисАкунин.Quotes)
        .ToArray();
}