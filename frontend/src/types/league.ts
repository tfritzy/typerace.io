export enum League {
    Bronze = 'bronze',
    Silver = 'silver',
    Gold = 'gold',
    Platinum = 'platinum',
    Diamond = 'diamond',
    Master = 'master',
}

export const getLeagueFromMmr = (mmr: number): League => {
    if (mmr < 1000) return League.Bronze;
    if (mmr < 1500) return League.Silver;
    if (mmr < 2000) return League.Gold;
    if (mmr < 2500) return League.Platinum;
    if (mmr < 3000) return League.Diamond;
    return League.Master;
};
