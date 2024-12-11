# Twitter Account Analyzer
- *Tech Stack*
    - Django Backend
        - Twitter post data API from Apify website (link)
        - Google Perspective API for toxicity evaluations
        - NLTK python library for positivity scores
        - Python pipeline library for content summarizer
        - TODO: image processing/captioning?
    - Angular Frontend

To use this source code (specifically the backend), you'll have to use your own API keys/authentication for Apify.com and Firebase (sorry, you can't use mine, since they're linked to my bank account). These should be in files called `/backend/api_key.txt` and `/backend/firebase.json` respectively (where the firebase file is just the relevant parts of your config file).

Feel free to build off of any of this source code!

## TODO
- Firebase function in caching/reading cached data (otherwise super insecure... I don't really care about preserving this data I guess but if it got destroyed it would cost me many more API requests, which is money out of my bank account)