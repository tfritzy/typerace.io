using System;

namespace SpacetimeDB;

public static class RobotNameGenerator
{
    private static readonly string[] Adjectives =
    {
        "Atomic", "Binary", "Cosmic", "Digital", "Electric", "Fusion", "Galactic", "Hyper",
        "Ionic", "Laser", "Magnetic", "Nano", "Optical", "Plasma", "Quantum", "Radiant",
        "Sonic", "Turbo", "Ultra", "Vector", "Wireless", "Xenon", "Zero", "Alpha",
        "Beta", "Gamma", "Delta", "Epsilon", "Omega", "Prime", "Mega", "Giga",
        "Tera", "Cyber", "Neuro", "Techno", "Astro", "Aero", "Pyro", "Cryo",
        "Electro", "Hydro", "Nitro", "Photo", "Thermo", "Chrome", "Steel", "Iron",
        "Copper", "Silver", "Gold", "Titanium", "Carbon", "Neon", "Argon", "Helium",
        "Rapid", "Swift", "Blitz", "Flash", "Bolt", "Spark", "Pulse", "Wave",
        "Beam", "Ray", "Core", "Matrix", "Neural", "Logic", "Data", "Pixel"
    };

    private static readonly string[] Nouns =
    {
        "Android", "Bot", "Cyborg", "Droid", "Engine", "Factory", "Gear", "Hub",
        "Interface", "Junction", "Kernel", "Link", "Machine", "Node", "Operator", "Processor",
        "Query", "Robot", "Server", "Terminal", "Unit", "Vertex", "Widget", "XUnit",
        "Yottabyte", "Zettabyte", "Automaton", "Circuit", "Chip", "Core", "Device", "Drive",
        "Frame", "Grid", "Hardware", "Interface", "Module", "Network", "Panel", "Protocol",
        "Router", "Scanner", "Sensor", "Switch", "System", "Transistor", "Transmitter", "Vector",
        "Worker", "Brain", "Clank", "Clutch", "Coil", "Conduit", "Dynamo", "Emitter",
        "Filter", "Generator", "Guardian", "Harvester", "Inspector", "Keeper", "Loader", "Monitor",
        "Navigator", "Observer", "Pilot", "Ranger", "Scout", "Sentinel", "Tracker", "Warden"
    };

    public static string Generate(Random rng)
    {
        var adjIndex = rng.Next(Adjectives.Length);
        var nounIndex = rng.Next(Nouns.Length);
        return $"{Adjectives[adjIndex]} {Nouns[nounIndex]}";
    }
}
