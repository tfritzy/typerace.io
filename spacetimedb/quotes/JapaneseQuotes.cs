using System;
using System.Linq;

namespace StdbModule;

public static partial class JapaneseQuotes
{
    public static readonly Quote[] Quotes =
        与謝野晶子.Quotes
        .Concat(中原中也.Quotes)
        .Concat(北原白秋.Quotes)
        .Concat(坂口安吾.Quotes)
        .Concat(夏目漱石.Quotes)
        .Concat(太宰治.Quotes)
        .Concat(宮沢賢治.Quotes)
        .Concat(島崎藤村.Quotes)
        .Concat(有島武郎.Quotes)
        .Concat(松尾芭蕉.Quotes)
        .Concat(正岡子規.Quotes)
        .Concat(永井荷風.Quotes)
        .Concat(石原慎太郎.Quotes)
        .Concat(石川啄木.Quotes)
        .Concat(芥川龍之介.Quotes)
        .Concat(萩原朔太郎.Quotes)
        .Concat(谷崎潤 - 郎.Quotes)
        .Concat(高村光太郎.Quotes)
        .ToArray();
}