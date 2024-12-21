export interface EmotionAnalysis {
    anger: number,
    anticipation: number,
    disgust: number,
    fear: number,
    joy: number,
    love: number,
    optimism: number,
    pessimism: number,
    sadness: number,
    surprise: number,
    trust: number,
}
export interface HateAnalysis {
    hate: number,
    not_hate: number,
}
export interface IronyAnalysis {
    irony: number,
    non_irony: number,
}
export interface OffensiveAnalysis {
    offensive: number,
    'non-offensive': number,
}
export interface SentimentAnalysis {
    negative: number,
    neutral: number,
    positive: number
}
export interface TopicAnalysis {
    'arts_&_culture': number,
    'fashion_&_style': number,
    'learning_&_educational': number,
    'science_&_technology': number,
    'business_&_entrepreneurs': number,
    'film_tv_&_video': number,
    music: number,
    sports: number,
    'celebrity_&_pop_culture': number,
    'fitness_&_health': number,
    'news_&_social_concern': number,
    'travel_&_adventure': number,
    'diaries_&_daily_life': number,
    'food_&_dining': number,
    'other_hobbies': number,
    'youth_&_student_life': number,
    family: number,
    gaming: number,
    relationships: number
}

export interface Frequency {
    word: string,
    abs_freq: number,
    rel_value: number,
    wtd_freq: number,
}
export interface FrequencyAnalysis {
    bigrams: Map<Number, Frequency>,
    words: Map<Number, Frequency>,
}



export interface Analysis {
    emotions: EmotionAnalysis,
    hate: HateAnalysis,
    irony: IronyAnalysis,
    offensive: OffensiveAnalysis,
    sentiment: SentimentAnalysis,
    topics: TopicAnalysis,
    word_frequencies: FrequencyAnalysis,
}
export interface Account {
    accountID: string,
    bio: string,
    blueVerified: boolean,
    created: string,
    displayName: string,
    followers: number,
    following: number,
    lastUpdated: string,
    location: string,
    pfpURL: string,
    url: string,
    verified: boolean
}
export interface AccountAnalysis {
    profile: Account,
    analysis: Analysis
}

export interface QuoteTweet {
    contents: string,
    created: string,
    media_url?: string,

    boomarks: number,
    likes: number,
    quotes: number,
    replies: number,
    retweets: number,
    views: number,
}
export interface Post {
    attachments? : {
        0 : {
            url : string
        }
    }
    quote?: {
        account: {
            username: string,
            displayName: string,
            pfpURL: string,
        },
        post: QuoteTweet
    }

    boomarks: number,
    likes: number,
    quotes: number,
    replies: number,
    retweets: number,
    views: number,

    contents: string,
    created: string,
    url: string,

    emotions: Map<String, Number>,
    sentiment: Map<String, Number>,
    topics: Map<String, Number>,
    hate: { label: string, score: number },
    irony: { label: string, score: number },
    offensive: { label: string, score: number },
}