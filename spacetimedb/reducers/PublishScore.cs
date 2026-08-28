using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void publishScore(ReducerContext ctx, string gameId, string language, int score, long scoreProof)
    {
        if (!IsValidScoreGameId(gameId))
        {
            throw new Exception("Invalid game ID");
        }

        if (!IsValidScoreLanguage(language))
        {
            throw new Exception("Invalid language");
        }

        if (score < 0)
        {
            throw new Exception("Score cannot be negative");
        }

        if (!IsValidScoreProof(gameId, language, score, scoreProof))
        {
            throw new Exception("Invalid score proof");
        }

        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var day = DateTimeOffset.FromUnixTimeSeconds(timestamp / 1_000_000).ToUniversalTime().ToString("yyyy-MM-dd");
        var player = ctx.Db.player.Identity.Find(ctx.Sender);
        var playerName = player?.Name ?? $"Anonymous {AnimalNameGenerator.Generate(ctx.Rng)}";
        var scoreId = $"{gameId}_{language}_{day}_{ctx.Sender}";
        var existingScore = ctx.Db.game_score.Id.Find(scoreId);
        if (existingScore == null)
        {
            ctx.Db.game_score.Insert(new GameScore
            {
                Id = scoreId,
                GameId = gameId,
                Language = language,
                PlayerId = ctx.Sender,
                PlayerName = playerName,
                Value = score,
                Timestamp = timestamp,
                TimeMs = 0,
                Day = day
            });
        }
        else if (score > existingScore.Value.Value)
        {
            var currentScore = existingScore.Value;
            ctx.Db.game_score.Id.Update(new GameScore
            {
                Id = currentScore.Id,
                GameId = currentScore.GameId,
                Language = currentScore.Language,
                PlayerId = currentScore.PlayerId,
                PlayerName = playerName,
                Value = score,
                Timestamp = timestamp,
                TimeMs = currentScore.TimeMs,
                Day = currentScore.Day
            });
        }

        var highScoreId = $"{gameId}_{language}_{ctx.Sender}";
        var existingHighScore = ctx.Db.game_highscore.Id.Find(highScoreId);
        if (existingHighScore == null)
        {
            ctx.Db.game_highscore.Insert(new GameHighScore
            {
                Id = highScoreId,
                GameId = gameId,
                Language = language,
                PlayerId = ctx.Sender,
                PlayerName = playerName,
                Value = score,
                Timestamp = timestamp,
                TimeMs = 0
            });
            return;
        }

        if (score > existingHighScore.Value.Value)
        {
            var updatedHighScore = existingHighScore.Value;
            updatedHighScore.PlayerName = playerName;
            updatedHighScore.Value = score;
            updatedHighScore.Timestamp = timestamp;
            updatedHighScore.TimeMs = 0;
            ctx.Db.game_highscore.Id.Update(updatedHighScore);
        }
    }
}
