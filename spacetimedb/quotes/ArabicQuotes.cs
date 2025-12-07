using System;
using System.Linq;

namespace StdbModule;

public static partial class ArabicQuotes
{
    public static readonly Quote[] Quotes =
        أحمدشوقي.Quotes
        .Concat(أدونيس.Quotes)
        .Concat(أملدنقل.Quotes)
        .Concat(إميلحبيبي.Quotes)
        .Concat(إيلياأبوماضي.Quotes)
        .Concat(ابنخلدون.Quotes)
        .Concat(ابنرشد.Quotes)
        .Concat(ابنسينا.Quotes)
        .Concat(ابنعربي.Quotes)
        .Concat(الجاحظ.Quotes)
        .Concat(الطيبصالح.Quotes)
        .Concat(الغزالي.Quotes)
        .Concat(المتنبي.Quotes)
        .Concat(بدرشاكرالسياب.Quotes)
        .Concat(بهاءطاهر.Quotes)
        .Concat(توفيقالحكيم.Quotes)
        .Concat(جبرانخليلجبران.Quotes)
        .Concat(جمالالغيطاني.Quotes)
        .Concat(جميلصدقيالزهاوي.Quotes)
        .Concat(حافظإبراهيم.Quotes)
        .Concat(حنامينه.Quotes)
        .Concat(زكينجيبمحمود.Quotes)
        .Concat(سعداللهونوس.Quotes)
        .Concat(سميحالقاسم.Quotes)
        .Concat(صنعاللهإبراهيم.Quotes)
        .Concat(طهحسين.Quotes)
        .Concat(عبدالرحمنمنيف.Quotes)
        .Concat(عمرالخيام.Quotes)
        .Concat(غسانكنفاني.Quotes)
        .Concat(فدوىطوقان.Quotes)
        .Concat(محمدالماغوط.Quotes)
        .Concat(محمدمندور.Quotes)
        .Concat(معروفالرصافي.Quotes)
        .Concat(ميخائيلنعيمة.Quotes)
        .Concat(نازكالملائكة.Quotes)
        .Concat(نجيبمحفوظ.Quotes)
        .Concat(نزارقباني.Quotes)
        .Concat(يحيىحقي.Quotes)
        .Concat(يوسفإدريس.Quotes)
        .ToArray();
}