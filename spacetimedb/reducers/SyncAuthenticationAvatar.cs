using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void syncAuthenticationAvatar(
        ReducerContext ctx,
        string? photoUrl
    )
    {
        var player = ctx.Db.player.Identity.Find(ctx.Sender);
        Uri? photoUri = null;

        if (
            !string.IsNullOrWhiteSpace(photoUrl)
            && photoUrl.Length <= 2_048
            && Uri.TryCreate(photoUrl, UriKind.Absolute, out var parsedUri)
            && parsedUri.Scheme == Uri.UriSchemeHttps
        )
        {
            photoUri = parsedUri;
        }

        if (
            player == null
            || player.Value.IsAnonymous
            || !UseAuthenticationAvatar(ctx)
            || photoUri == null
        )
        {
            RemovePlayerAvatar(ctx);
            return;
        }

        var avatar = new PlayerAvatar
        {
            Identity = ctx.Sender,
            PhotoUrl = photoUri.AbsoluteUri
        };

        if (ctx.Db.playeravatar.Identity.Find(ctx.Sender) == null)
        {
            ctx.Db.playeravatar.Insert(avatar);
        }
        else
        {
            ctx.Db.playeravatar.Identity.Update(avatar);
        }
    }

    private static void RemovePlayerAvatar(ReducerContext ctx)
    {
        ctx.Db.playeravatar.Identity.Delete(ctx.Sender);
    }
}
