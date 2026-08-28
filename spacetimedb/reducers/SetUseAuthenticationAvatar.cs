using System.Text.Json;
using System.Text.Json.Nodes;
using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const string UseAuthenticationAvatarKey = "useAuthenticationAvatar";

    [Reducer]
    public static void setUseAuthenticationAvatar(
        ReducerContext ctx,
        bool value,
        string? photoUrl
    )
    {
        MutatePlayerSettings(
            ctx,
            settings => settings[UseAuthenticationAvatarKey] = value
        );

        syncAuthenticationAvatar(ctx, value ? photoUrl : null);
    }

    private static bool UseAuthenticationAvatar(ReducerContext ctx)
    {
        var existing = ctx.Db.playersettings.Identity.Find(ctx.Sender);
        if (existing == null)
        {
            return true;
        }

        try
        {
            var settings = JsonNode.Parse(existing.Value.Value) as JsonObject;
            if (settings?[UseAuthenticationAvatarKey] is not JsonValue value)
            {
                return true;
            }

            return !value.TryGetValue<bool>(out var enabled) || enabled;
        }
        catch (JsonException)
        {
            return true;
        }
    }
}
