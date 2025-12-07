using System;
using System.Linq;

namespace StdbModule;

public static partial class RussianQuotes
{
    public static readonly Quote[] Quotes =
        АлександрПушкин.Quotes
        .Concat(АлександрСолженицын.Quotes)
        .Concat(АндрейБелый.Quotes)
        .Concat(АндрейПлатонов.Quotes)
        .Concat(АфанасийФет.Quotes)
        .Concat(БорисАкунин.Quotes)
        .Concat(ВалентинРаспутин.Quotes)
        .Concat(ВелимирХлебников.Quotes)
        .Concat(ВикторАстафьев.Quotes)
        .Concat(ВикторШкловский.Quotes)
        .Concat(ВладимирМаяковский.Quotes)
        .Concat(ВладиславХодасевич.Quotes)
        .Concat(ИльяИльф.Quotes)
        .Concat(ИосифБродский.Quotes)
        .Concat(КонстантинБальмонт.Quotes)
        .Concat(КонстантинПаустовский.Quotes)
        .Concat(ЛевТолстой.Quotes)
        .Concat(ЛюдмилаУлицкая.Quotes)
        .Concat(МаксимГорький.Quotes)
        .Concat(МихаилБулгаков.Quotes)
        .Concat(МихаилЗощенко.Quotes)
        .Concat(НиколайАсеев.Quotes)
        .Concat(НиколайЛесков.Quotes)
        .Concat(НиколайЛосский.Quotes)
        .Concat(ОсипМандельштам.Quotes)
        .Concat(Тэффи.Quotes)
        .Concat(ФёдорСтепун.Quotes)
        .Concat(ЮрийТынянов.Quotes)
        .ToArray();
}