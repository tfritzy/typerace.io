using System.Text.Json;
using System.Text.Json.Nodes;
using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const int MaxPlayerSettingsLength = 16_384;

    private static void MutatePlayerSettings(
        ReducerContext ctx,
        Action<JsonObject> mutate
    )
    {
        var existing = ctx.Db.playersettings.Identity.Find(ctx.Sender);
        var settings = new JsonObject();

        if (existing != null)
        {
            try
            {
                settings = JsonNode.Parse(existing.Value.Value) as JsonObject
                    ?? new JsonObject();
            }
            catch (JsonException)
            {
                settings = new JsonObject();
            }
        }

        mutate(settings);

        var serializedValue = settings.ToJsonString();
        if (serializedValue.Length > MaxPlayerSettingsLength)
        {
            throw new Exception("Player settings are too large");
        }

        var playerSettings = new PlayerSettings
        {
            Identity = ctx.Sender,
            Value = serializedValue
        };

        if (existing == null)
        {
            ctx.Db.playersettings.Insert(playerSettings);
        }
        else
        {
            ctx.Db.playersettings.Identity.Update(playerSettings);
        }
    }
}
