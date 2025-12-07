using System;
using System.Linq;

namespace StdbModule;

public static partial class UkrainianQuotes
{
    public static readonly Quote[] Quotes =
        ЄвгенГуцало.Quotes
        .Concat(ІванБагряний.Quotes)
        .Concat(ІванДрач.Quotes)
        .Concat(ІванНечуйЛевицький.Quotes)
        .Concat(ІзидораКосач.Quotes)
        .Concat(БогданІгорАнтонич.Quotes)
        .Concat(ВалерянПідмогильний.Quotes)
        .Concat(ВасильСимоненко.Quotes)
        .Concat(ВасильСтус.Quotes)
        .Concat(ВолодимирВинниченко.Quotes)
        .Concat(ВолодимирДрозд.Quotes)
        .Concat(ГалинаТурелик.Quotes)
        .Concat(ГригорійСковорода.Quotes)
        .Concat(ЛесяУкраїнка.Quotes)
        .Concat(МаркоВовчок.Quotes)
        .Concat(МиколаЄвшан.Quotes)
        .Concat(МиколаБажан.Quotes)
        .Concat(МиколаЗеров.Quotes)
        .Concat(МиколаХвильовий.Quotes)
        .Concat(МихайлоКоцюбинський.Quotes)
        .Concat(ОксанаЗабужко.Quotes)
        .Concat(ОлександрОлесь.Quotes)
        .Concat(ОлесьГончар.Quotes)
        .Concat(ОльгаКобилянська.Quotes)
        .Concat(ОстапВишня.Quotes)
        .Concat(ПанасМирний.Quotes)
        .Concat(ТарасПрохасько.Quotes)
        .Concat(ТарасШевченко.Quotes)
        .Concat(УласСамчук.Quotes)
        .Concat(ЮрійАндрухович.Quotes)
        .Concat(ЮрійЯновський.Quotes)
        .ToArray();
}