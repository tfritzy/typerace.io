using System;
using System.Linq;


namespace StdbModule;
public static partial class DutchQuotes
{
    public static readonly Quote[] Quotes = 
        AnneFrank.Quotes
        .Concat(HarryMulisch.Quotes)
        .Concat(GerardReve.Quotes)
        .Concat(LouisCouperus.Quotes)
        .Concat(Multatuli.Quotes)
        .Concat(HermanGorter.Quotes)
        .Concat(WillemFrederikHermans.Quotes)
        .Concat(CeesNooteboom.Quotes)
        .Concat(ArnonGrunberg.Quotes)
        .Concat(RemcoCampert.Quotes)
        .Concat(SimonCarmiggelt.Quotes)
        .Concat(GodfriedBomans.Quotes)
        .Concat(TomLanoye.Quotes)
        .Concat(HugoClaus.Quotes)
        .Concat(DimitriVerhulst.Quotes)
        .Concat(JoostvandenVondel.Quotes)
        .Concat(EduardDouwesDekker.Quotes)
        .Concat(NicolaasBeets.Quotes)
        .Concat(FrederikvanEeden.Quotes)
        .Concat(FelixTimmermans.Quotes)
        .Concat(HendrikConscience.Quotes)
        .Concat(WillemElsschot.Quotes)
        .Concat(MartinusNijhoff.Quotes)
        .Concat(PaulvanOstaijen.Quotes)
        .Concat(JSlauerhoff.Quotes)
        .Concat(Lucebert.Quotes)
        .Concat(GerritAchterberg.Quotes)
        .Concat(HansAndreus.Quotes)
        .ToArray();
}