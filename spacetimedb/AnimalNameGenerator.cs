using System;
using System.Security.Cryptography;

namespace SpacetimeDB;

public static class AnimalNameGenerator
{
    private static readonly string[] Animals = 
    {
        "Aardvark", "Albatross", "Alligator", "Alpaca", "Ant", "Anteater", "Antelope", "Ape",
        "Badger", "Barracuda", "Bat", "Bear", "Beaver", "Bee", "Bison", "Butterfly",
        "Camel", "Capybara", "Caribou", "Cassowary", "Cat", "Caterpillar", "Cheetah", "Chicken",
        "Chimpanzee", "Chinchilla", "Clownfish", "Cobra", "Cockroach", "Cod", "Cormorant", "Coyote",
        "Crab", "Crane", "Crocodile", "Crow", "Curlew",
        "Deer", "Dinosaur", "Dog", "Dogfish", "Dolphin", "Donkey", "Dotterel", "Dove",
        "Dragonfly", "Duck", "Dugong", "Dunlin",
        "Eagle", "Echidna", "Eel", "Eland", "Elephant", "Elk", "Emu", "Falcon",
        "Ferret", "Finch", "Fish", "Flamingo", "Fly", "Fox", "Frog",
        "Gazelle", "Gerbil", "Giraffe", "Gnat", "Gnu", "Goat", "Goldfinch", "Goldfish",
        "Goose", "Gorilla", "Goshawk", "Grasshopper", "Grouse", "Guanaco", "Gull",
        "Hamster", "Hare", "Hawk", "Hedgehog", "Heron", "Herring", "Hippopotamus", "Hornet",
        "Horse", "Hummingbird", "Hyena",
        "Ibex", "Ibis", "Iguana", "Impala",
        "Jackal", "Jaguar", "Jay", "Jellyfish",
        "Kangaroo", "Kingfisher", "Koala", "Kookabura",
        "Lark", "Lemur", "Leopard", "Lion", "Llama", "Lobster", "Locust", "Loris", "Louse", "Lyrebird",
        "Magpie", "Mallard", "Manatee", "Mandrill", "Mantis", "Marten", "Meerkat", "Mink",
        "Mole", "Mongoose", "Monkey", "Moose", "Mosquito", "Mouse", "Mule",
        "Narwhal", "Newt", "Nightingale",
        "Octopus", "Okapi", "Opossum", "Oryx", "Ostrich", "Otter", "Owl", "Oyster",
        "Panther", "Parrot", "Partridge", "Peacock", "Pelican", "Penguin", "Pheasant", "Pig",
        "Pigeon", "Pony", "Porcupine", "Porpoise", "Prairie Dog", "Puffin",
        "Quail", "Quelea", "Quetzal", "Quokka", "Quoll",
        "Rabbit", "Raccoon", "Rail", "Ram", "Rat", "Raven", "Reindeer", "Rhinoceros",
        "Rook",
        "Salamander", "Salmon", "Sandpiper", "Sardine", "Scorpion", "Seahorse", "Seal", "Shark",
        "Sheep", "Shrew", "Shrimp", "Skunk", "Snail", "Snake", "Sparrow", "Spider",
        "Spoonbill", "Squid", "Squirrel", "Starling", "Stingray", "Stork", "Swallow", "Swan",
        "Tapir", "Tarsier", "Termite", "Tiger", "Toad", "Trout", "Turkey", "Turtle",
        "Viper", "Vulture",
        "Wallaby", "Walrus", "Wasp", "Weasel", "Whale", "Wildcat", "Wolf", "Wolverine",
        "Wombat", "Woodpecker", "Worm",
        "Yak",
        "Zebra"
    };

    public static string Generate()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(4);
        var randomValue = BitConverter.ToUInt32(randomBytes, 0);
        var index = randomValue % (uint)Animals.Length;
        return Animals[index];
    }
}
