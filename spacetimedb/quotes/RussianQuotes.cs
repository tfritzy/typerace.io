using System;
using System.Linq;

namespace StdbModule;

public static partial class RussianQuotes
{
    public static readonly Quote[] Quotes =
        АлександрПушкин.Quotes
        .Concat(АлександрСолженицын.Quotes)
        .Concat(АфанасийФет.Quotes)
        .Concat(ВикторШкловский.Quotes)
        .Concat(ВладимирМаяковский.Quotes)
        .Concat(ИосифБродский.Quotes)
        .Concat(ЛевТолстой.Quotes)
        .Concat(МаксимГорький.Quotes)
        .Concat(НиколайАсеев.Quotes)
        .Concat(Тэффи.Quotes)
        .ToArray();
}
