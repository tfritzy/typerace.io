using System;
using System.Linq;

namespace StdbModule;

public static partial class DutchQuotes
{
    public static readonly Quote[] Quotes =
        AnneFrank.Quotes
        .Concat(ArnonGrunberg.Quotes)
        .Concat(CeesNooteboom.Quotes)
        .Concat(DimitriVerhulst.Quotes)
        .Concat(EduardDouwesDekker.Quotes)
        .Concat(FelixTimmermans.Quotes)
        .Concat(FrederikvanEeden.Quotes)
        .Concat(GerardReve.Quotes)
        .Concat(GerritAchterberg.Quotes)
        .Concat(GodfriedBomans.Quotes)
        .Concat(HansAndreus.Quotes)
        .Concat(HarryMulisch.Quotes)
        .Concat(HendrikConscience.Quotes)
        .Concat(HermanGorter.Quotes)
        .Concat(HugoClaus.Quotes)
        .Concat(JSlauerhoff.Quotes)
        .Concat(JoostvandenVondel.Quotes)
        .Concat(LouisCouperus.Quotes)
        .Concat(Lucebert.Quotes)
        .Concat(MartinusNijhoff.Quotes)
        .Concat(Multatuli.Quotes)
        .Concat(NicolaasBeets.Quotes)
        .Concat(PaulvanOstaijen.Quotes)
        .Concat(RemcoCampert.Quotes)
        .Concat(SimonCarmiggelt.Quotes)
        .Concat(TomLanoye.Quotes)
        .Concat(WillemElsschot.Quotes)
        .Concat(WillemFrederikHermans.Quotes)
        .ToArray();
}