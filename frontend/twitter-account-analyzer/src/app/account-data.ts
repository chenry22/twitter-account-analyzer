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

export interface AccountArray extends Array<Account> { }