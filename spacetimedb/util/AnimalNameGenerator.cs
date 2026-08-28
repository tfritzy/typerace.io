using System;

namespace SpacetimeDB;

public static class AnimalNameGenerator
{
    // Keep anonymous player names familiar and playful. In particular, avoid animal
    // terms that are commonly used as insults or derogatory labels for people.
    private static readonly string[] Animals =
    {
        "Alpaca", "Bear", "Bee", "Bunny", "Butterfly",
        "Cat", "Cheetah", "Chipmunk",
        "Dinosaur", "Dolphin", "Duck",
        "Eagle",
        "Flamingo",
        "Giraffe", "Goldfish",
        "Hamster", "Hedgehog", "Hummingbird",
        "Kangaroo", "Kitten", "Koala",
        "Ladybug", "Lion", "Llama",
        "Octopus", "Otter", "Owl",
        "Panda", "Penguin", "Pony", "Puppy",
        "Rabbit", "Reindeer",
        "Seahorse", "Squirrel", "Swan",
        "Tiger", "Toucan", "Turtle",
        "Zebra"
    };

    public static string Generate(Random rng)
    {
        var index = rng.Next(Animals.Length);
        return Animals[index];
    }
}
