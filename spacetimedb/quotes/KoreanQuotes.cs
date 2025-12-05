using System;
using System.Linq;


namespace StdbModule;
public static partial class KoreanQuotes
{
    public static readonly Quote[] Quotes = 
        김소월.Quotes
        .Concat(윤동주.Quotes)
        .Concat(이상.Quotes)
        .Concat(김수영.Quotes)
        .Concat(한용운.Quotes)
        .Concat(박목월.Quotes)
        .Concat(서정주.Quotes)
        .Concat(정지용.Quotes)
        .Concat(백석.Quotes)
        .Concat(이육사.Quotes)
        .Concat(김춘수.Quotes)
        .Concat(김지하.Quotes)
        .Concat(고은.Quotes)
        .Concat(황동규.Quotes)
        .Concat(김광섭.Quotes)
        .Concat(조지훈.Quotes)
        .Concat(박두진.Quotes)
        .Concat(이형기.Quotes)
        .Concat(천상병.Quotes)
        .Concat(황지우.Quotes)
        .Concat(이광수.Quotes)
        .Concat(김동인.Quotes)
        .Concat(김유정.Quotes)
        .Concat(박경리.Quotes)
        .Concat(김동리.Quotes)
        .Concat(이청준.Quotes)
        .Concat(박완서.Quotes)
        .Concat(조세희.Quotes)
        .Concat(신경숙.Quotes)
        .Concat(한강.Quotes)
        .ToArray();
}