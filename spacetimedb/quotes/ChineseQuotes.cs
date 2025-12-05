using System;
using System.Linq;
using static StdbModule.ChineseQuotes;

namespace StdbModule;

public static partial class ChineseQuotes
{
    public static readonly Quote[] Quotes =
        鲁迅.Quotes
        .Concat(老子.Quotes)
        .Concat(孔子.Quotes)
        .Concat(莊子.Quotes)
        .Concat(李白.Quotes)
        .Concat(杜甫.Quotes)
        .Concat(曹雪芹.Quotes)
        .Concat(余华.Quotes)
        .Concat(孟子.Quotes)
        .Concat(荀子.Quotes)
        .Concat(墨子.Quotes)
        .Concat(列子.Quotes)
        .Concat(屈原.Quotes)
        .Concat(王羲之.Quotes)
        .Concat(白居易.Quotes)
        .Concat(柳宗元.Quotes)
        .Concat(刘禹锡.Quotes)
        .Concat(王安石.Quotes)
        .Concat(李清照.Quotes)
        .Concat(汤显祖.Quotes)
        .Concat(施耐庵.Quotes)
        .Concat(罗贯中.Quotes)
        .Concat(蒲松龄.Quotes)
        .Concat(严复.Quotes)
        .Concat(章太炎.Quotes)
        .Concat(陈独秀.Quotes)
        .Concat(李大钊.Quotes)
        .Concat(周作人.Quotes)
        .Concat(茅盾.Quotes)
        .Concat(巴金.Quotes)
        .Concat(老舍.Quotes)
        .Concat(杨绛.Quotes)
        .Concat(冰心.Quotes)
        .Concat(丁玲.Quotes)
        .Concat(徐志摩.Quotes)
        .Concat(艾青.Quotes)
        .Concat(卞之琳.Quotes)
        .Concat(穆旦.Quotes)
        .Concat(郭沫若.Quotes)
        .Concat(曹禺.Quotes)
        .Concat(汪曾祺.Quotes)
        .Concat(莫言.Quotes)
        .ToArray();
}