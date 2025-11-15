using System;

namespace SpacetimeDB;

public static class BotNameGenerator
{
    private static readonly string[] Adjectives =
    {
        "Automated", "Binary", "Calculated", "Digital", "Electric", "Functional",
        "Geometric", "Hydraulic", "Integrated", "Kinetic", "Logical", "Mechanical",
        "Neural", "Optical", "Programmed", "Quantum", "Robotic", "Synthetic",
        "Tactical", "Unified", "Virtual", "Wired", "Xenon", "Zealous",
        "Advanced", "Bright", "Clever", "Dynamic", "Efficient", "Fast",
        "Glowing", "Hardened", "Intelligent", "Jolly", "Keen", "Lightning",
        "Mighty", "Noble", "Optimized", "Precise", "Quick", "Reliable",
        "Speedy", "Turbo", "Ultimate", "Vigilant", "Wise", "Zippy"
    };

    private static readonly string[] Nouns =
    {
        "Android", "Bot", "Circuit", "Drone", "Engine", "Firmware",
        "Gear", "Hardware", "Interface", "Jack", "Kernel", "Loader",
        "Machine", "Node", "Operator", "Processor", "Query", "Robot",
        "System", "Terminal", "Unit", "Vector", "Widget", "Xenomorph",
        "Yield", "Zero", "Analyzer", "Builder", "Compiler", "Debugger",
        "Editor", "Function", "Generator", "Handler", "Iterator", "Job",
        "Key", "Lambda", "Module", "Network", "Object", "Parser",
        "Queue", "Runtime", "Server", "Thread", "Utility", "Variable",
        "Worker", "Executor"
    };

    public static string Generate(Random rng)
    {
        var adjective = Adjectives[rng.Next(Adjectives.Length)];
        var noun = Nouns[rng.Next(Nouns.Length)];
        return $"{adjective} {noun}";
    }
}
