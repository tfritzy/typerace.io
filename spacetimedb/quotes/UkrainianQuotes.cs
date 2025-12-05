using System;
using System.Linq;
using static StdbModule.UkrainianQuotes;

namespace StdbModule;

public static partial class UkrainianQuotes
{
    public static readonly Quote[] Quotes =
        ТарасШевченко.Quotes
        .Concat(ЛесяУкраїнка.Quotes)
        .Concat(МихайлоКоцюбинський.Quotes)
        .Concat(ГригорійСковорода.Quotes)
        .Concat(МаркоВовчок.Quotes)
        .Concat(ІванНечуйЛевицький.Quotes)
        .Concat(ПанасМирний.Quotes)
        .Concat(ВолодимирВинниченко.Quotes)
        .Concat(ОльгаКобилянська.Quotes)
        .Concat(ОлександрОлесь.Quotes)
        .Concat(МиколаБажан.Quotes)
        .Concat(ОстапВишня.Quotes)
        .Concat(ЮрійЯновський.Quotes)
        .Concat(МиколаХвильовий.Quotes)
        .Concat(ВалерянПідмогильний.Quotes)
        .Concat(ІванБагряний.Quotes)
        .Concat(УласСамчук.Quotes)
        .Concat(БогданІгорАнтонич.Quotes)
        .Concat(ВасильСимоненко.Quotes)
        .Concat(ІванДрач.Quotes)
        .Concat(ЄвгенГуцало.Quotes)
        .Concat(ВолодимирДрозд.Quotes)
        .Concat(ОлесьГончар.Quotes)
        .Concat(ЮрійАндрухович.Quotes)
        .Concat(ТарасПрохасько.Quotes)
        .ToArray();
}