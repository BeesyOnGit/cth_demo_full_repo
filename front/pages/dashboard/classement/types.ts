export type RankingDrAntennesStats = {
    period: {
        start: Date;
        end: Date;
    };
    rankings: Array<{
        dr: string;
        antenne: string;
        turnover: number;
        collection: number;
    }>;
};

export type RankingType = "dr" | "antenne";
export type RankingMetric = "turnover" | "collection";
