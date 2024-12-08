from rest_framework.response import Response
from rest_framework.views import APIView, exception_handler
import json
import datetime
import pyrebase
from apify_client import ApifyClient

# how much data will be requested in an API call
MAX_POSTS_FROM_API = 50

with open('firebase.json', 'r') as f:
    # don't leak the firebase config stuff...
    config = json.load(f)
    firebase = pyrebase.initialize_app(config)
    db = firebase.database()

with open('api_key.txt', 'r') as f:
    # this should be a secret too.
    apify_key = f.read().rstrip()
    apify_client = ApifyClient(apify_key)


class AccountAnalyzer(APIView):
    def get(self, request, accountHandle):
        accountData = getAccountData(accountHandle)

        # do sentiment analysis on posts

        return Response()

# just get the basic account data
class AccountSummary(APIView):
    def get(self, request, accountHandle):
        """ Return X account summary cached in Firebase or generate new one

            This includes the basic profile info as well as the top 20 posts
            from that account, with all relevant statistics as well. """

        return Response(getAccountData(accountHandle))
    
def getAccountData(accountHandle):
    # TODO: first check if account even exists...
        # if not, don't waste time/API costs doing this stuff...

    # check firestore DB, if cached from past day or so just use that 
    cached = db.child("Accounts").child(accountHandle).get().val()
    if cached is not None:
        print("Found cached data in Firebase")
        data = {
            "profile" : cached,
            "posts" : db.child("TopPosts").child(cached["accountID"]).get().val()
        }
        return data
    else:
        # if no valid entry, get most relevant posts from that account
        request = {
            "since": "2021-12-31_23:59:59_UTC", # TODO: decide range...
            "maxItems" : MAX_POSTS_FROM_API,
            "queryType" : "Top",
            "lang" : "en",
            "from" : accountHandle,
            "-filter:replies" : True # don't include replies
        }

        # send request to the API we're using (this is not a private key, it's the API's public ID)
        run = apify_client.actor("CJdippxWmn9uRfooo").call(run_input=request)
        data = { "posts" : {} }
        i = 0
        items = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
        total_items = len(items)
        for item in items:
            # first run should parse user info
            if not "profile" in data.keys():
                print("Parsing profile: " + str(accountHandle))
                account = item["author"]
                data["profile"] = {
                    "accountID" : account["id"], "url" : account["url"], "displayName" : account["name"],
                    "verified" : account["isVerified"], "blueVerified" : account["isBlueVerified"],
                    "pfpURL" : account["profilePicture"], "location" : account["location"],
                    "followers" : account["followers"], "following" : account["following"],
                    "created" : account["createdAt"], "bio" : account["profile_bio"]["description"],
                    "lastUpdated" : datetime.date.today().strftime("%Y-%m-%d")
                }

            i += 1
            print("     [ Post " + str(i) + " / " + str(total_items) + "]")
            # parse post for relevant data (words/contents + interactions [likes, retweets, views, etc])
            post = {
                "url" : item["url"], "contents" : item["text"],
                "likes" : item["likeCount"], "retweets" : item["retweetCount"], "replies" : item["replyCount"],
                "quotes" : item["quoteCount"], "boomarks" : item["bookmarkCount"], "views" : item["viewCount"],
                "created" : item["createdAt"], "lang" : item["lang"]
            }

            # add any attached media (images, vids, etc)
            try:
                attachments = []
                for media in item["extendedEntities"]["media"]:
                    attachments += [{
                        "url" : media["media_url_https"]
                    }]
                post["attachments"] = attachments
            except:
                print("        No media associated w/ post or failed to parse")

            # add quote context if applicable
            try:
                user = item["quoted_tweet_results"]["result"]["core"]["user_results"]["result"]
                tweet = item["quoted_tweet_results"]["result"]["legacy"]

                post["quote"] = {
                    "account" : {
                        "username" : user["core"]["screen_name"],
                        "displayName" : user["core"]["name"],
                        "pfpURL" : user["avatar"]["image_url"]
                    },
                    "post" : {
                        "contents" : tweet["full_text"],
                        "likes" : tweet["favorite_count"], "retweets" : tweet["retweet_count"], "replies" : tweet["reply_count"],
                        "quotes" : tweet["quote_count"], "boomarks" : tweet["bookmark_count"],
                        "views" : item["quoted_tweet_results"]["result"]["view_count_info"]["count"],
                        "created" : tweet["created_at"], "lang" : tweet["lang"]
                    }
                }
            except:
                print("        No quoted tweet related or failed to parse")

            data["posts"][item["id"]] = post

        # once finished parsing API response, cache profile + posts in Firebase (with last updated date)
        db.child("Accounts").child(accountHandle).set(data["profile"])
        db.child("TopPosts").child(data["profile"]["accountID"]).set(data["posts"])
        return data