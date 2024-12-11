# Twitter Account Analyzer
- *Tech Stack*
    - Django Backend
        - Twitter post data API from Apify website (link)
        - HuggingFace text classification models trained on Twitter data
        - Firebase cache to avoid excessive repeated work
    - Angular Frontend

To use this source code (specifically the backend), you'll have to use your own API keys/authentication for Apify.com and Firebase (sorry, you can't use mine, since they're linked to my bank account). These should be in files called `/backend/api_key.txt` and `/backend/firebase.json` respectively (where the firebase file is just the relevant parts of your config file).

Right now, the backend can handle requests to get the basic data from a Twitter profile, and can do analysis of this data which is parses. This analysis includes classifying each individual post by sentiment (positivity/negativity), emotional subtext, irony, hate, offensive content, and relevant topics. Using the relevant collection of posts, it then summarizes this into an overview of the account itself.