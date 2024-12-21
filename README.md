# Twitter Account Analyzer
- *Tech Stack*
    - Firebase Database
    - Single Python script as 'backend' (in the future it would be cool to have something users actually directly connect to for sending requests for data, but I don't want to deal with paying to host something like that (overhead of HuggingFace model caches makes cost annoying))
        - Twitter post data API from Apify website
        - HuggingFace text classification models trained on Twitter data
    - Angular Frontend

To use the backend, you'll have to use your own API keys/authentication for Apify.com (sorry, you can't use mine since it's linked to my bank account) and firebase. These should be in files called `/backend/api_key.txt` and `/backend/firebase.json` respectively (where the firebase file is just the API key/config file identifying the app).

Right now, the backend can handle requests to get the basic data from a Twitter profile, and can do analysis of this data which is parses. This analysis includes classifying each individual post by sentiment (positivity/negativity), emotional tone, irony, hate, offensive content, and relevant topics. It then does an overall analysis of frequent words or phrases posted by the user.

- *To deploy: ng deploy --base-href=/twitter-account-analyzer/*
    - Note: This will only work with the angular-cli-ghpages module installed

## TODO:
- Add way to manually request reload of data (different from automatic one)
- Add way to see actual post analysis
    - add some string manipulation for shown contents (no links)

- Add list of top users on front page (like top 5 perhaps) and most recently updated
- Cache requests to local storage and have listener update when firebase is updated (on main page)
- About page