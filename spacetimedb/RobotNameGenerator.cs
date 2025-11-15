using System;

namespace SpacetimeDB;

public static class RobotNameGenerator
{
    private static readonly string[] Adjectives =
    {
        "Quantum", "Cyber", "Digital", "Binary", "Electric", "Neon", "Atomic", "Cosmic",
        "Turbo", "Ultra", "Mega", "Hyper", "Super", "Proto", "Neo", "Alpha",
        "Beta", "Gamma", "Delta", "Omega", "Prime", "Nova", "Stellar", "Solar",
        "Lunar", "Astro", "Techno", "Robo", "Mech", "Chrome", "Steel", "Titanium",
        "Plasma", "Laser", "Photon", "Neutron", "Proton", "Ion", "Volt", "Watt",
        "Circuit", "Logic", "Data", "Pixel", "Vector", "Matrix", "Neural", "Quantum",
        "Fusion", "Reactor", "Dynamo", "Spark", "Bolt", "Flash", "Blitz", "Sonic",
        "Rapid", "Swift", "Speedy", "Turbo", "Nitro", "Rocket", "Jet", "Aero"
    };

    private static readonly string[] Nouns =
    {
        "Bot", "Droid", "Cyborg", "Android", "Robot", "Automaton", "Machine", "Unit",
        "Core", "Processor", "Circuit", "Chip", "Module", "System", "Engine", "Drive",
        "Matrix", "Network", "Node", "Server", "Terminal", "Interface", "Portal", "Gateway",
        "Scanner", "Sensor", "Beacon", "Radar", "Probe", "Drone", "Mech", "Pilot",
        "Guardian", "Sentinel", "Warden", "Keeper", "Defender", "Protector", "Agent", "Operative",
        "Commander", "Captain", "Marshal", "Chief", "Leader", "Master", "Prime", "Ace",
        "Ranger", "Scout", "Voyager", "Explorer", "Pioneer", "Pathfinder", "Navigator", "Pilot",
        "Striker", "Fighter", "Warrior", "Soldier", "Trooper", "Battler", "Gladiator", "Champion"
    };

    public static string Generate(Random rng)
    {
        var adjective = Adjectives[rng.Next(Adjectives.Length)];
        var noun = Nouns[rng.Next(Nouns.Length)];
        return $"{adjective} {noun}";
    }
}
