namespace StdbModule;

public static partial class CzechQuotes
{
    public static class FranzKafka
    {
        private const string Source = "https://cs.wikiquote.org/wiki/Franz_Kafka";

        public static readonly Quote[] Quotes = new Quote[]
        {
            new Quote { Id = Source, Text = "Člověk může všechno, jen sám před sebou neunikne.", Author = "Franz Kafka" },
            new Quote { Id = Source, Text = "Pravda je nedělitelná, proto se sama nemůže poznávat; kdo ji chce poznat, musí být lží.", Author = "Franz Kafka" },
        };
    }
}
