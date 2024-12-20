from getpass import getpass

import pyrebase
from apify_client import ApifyClient
import requests

from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from transformers import pipeline

import advertools as adv
import html
import unicodedata
from unidecode import unidecode

from io import BytesIO
import json
import datetime

BASE_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
IRONY_MODEL = "cardiffnlp/twitter-roberta-base-irony"
TOPIC_MODEL = "cardiffnlp/tweet-topic-latest-multi"
EMOTION_MODEL = "cardiffnlp/twitter-roberta-base-emotion-multilabel-latest"
OFFENSIVE_MODEL = "cardiffnlp/twitter-roberta-base-offensive"
HATE_MODEL = "cardiffnlp/twitter-roberta-large-hate-latest"

MAX_POSTS_FROM_API = 100 # this costs real life money, so I'm being a little restrictive

# set up necessary API clients
with open('firebase.json', 'r') as f:
    app_config = json.load(f)
    firebase = pyrebase.initialize_app(app_config)
    db = firebase.database()
with open('api_key.txt', 'r') as f:
    apify_client = ApifyClient(f.read().rstrip())

# helper functions
def get_post_content(post: dict, img_processor, img_model) -> dict:
    ''' Stringifies a post dictionary, parsing relevant context needed for analysis. Specifically, if there is an associated image or a quote tweet, parse that context into a returned string:string dictionary.

        Args:
            post (dict): Dictionary with the following keys (extra data is fine as long as these paths are formatted correctly)
                "contents" : (full tweet text)
                "attachments" : {
                    "id" : {
                        "url": (media URL)
                    }
                }
                "quote" : {
                    "post" : {
                        "contents" : (full quote tweet text)
                    }
                }
            
            img_processer (BlipProcessor): Processor to be used if image needs text description
            img_model (BlipForConditionalGeneration): Model to be used if image needs text description
        
        Returns:
            Dictionary (str : str) with the following keys:
            - "main" : (post contents without any links)
            - "media" : (AI generated caption for any attachments)
            - "quote" : (quote tweet contents without any links)
            - "quote_media" : (AI generated caption for quote tweet attachment)
    '''
    content = { "main" : str(post['contents']).split("https://")[0] }
    # check any images that need to be processed as text
    if "attachments" in post.keys():
        response = requests.get(post["attachments"][0]["url"])
        if response.status_code == 200:
            img_data = BytesIO(response.content)  # Store in memory
            image = Image.open(img_data).convert("RGB")

            inputs = img_processor(image, return_tensors="pt")
            output = img_model.generate(**inputs)
            content["media"] = img_processor.decode(output[0], skip_special_tokens=True)
        else:
            print(f"Failed to fetch image. Status code: {response.status_code}")

    # check for quote tweet context
    if "quote" in post.keys():
        content["quote"] = str(post["quote"]["post"]["contents"]).split("https://")[0]
        if "media_url" in post["quote"]["post"] and post["quote"]["post"]["media_url"] != '':
            response = requests.get(post["quote"]["post"]["media_url"])
            if response.status_code == 200:
                img_data = BytesIO(response.content)  # Store in memory
                image = Image.open(img_data).convert("RGB")

                inputs = img_processor(image, return_tensors="pt")
                output = img_model.generate(**inputs)
                content["quote_media"] = img_processor.decode(output[0], skip_special_tokens=True)
            else:
                print(f"Failed to fetch image. Status code: {response.status_code}")
    return content

def post_stringify(post: dict, include_quote: bool = False) -> str:
    ''' Stringifies a reduced post dictionary '''
    content = f"(image of {post['media']}) {post['main']}" if 'media' in post.keys() else post['main']
    if include_quote and 'quote' in post.keys():
        if 'quote_media' in post.keys():
            return f"Context: (image of {post['quote_media']}) {post['quote']} Response: {content}"
        else:
            return f"Context: {post['quote']} Response: {content}"
    else:
        return content

def get_label_summary(items):
    ''' Converts a list of items' attributes to a dictionary of these attributes and the overall partition of these attributes in the collection 
    
        Args:
            items(list(list(dict))): List of pipeline output, where each item in the main list is a list of { "label" : x, "score" : x } objects

        Outputs:
            list: Original list of dictionaries simplified into { label : score } instead of [{ "label" : x, "score" : x}...]
            dict: Dictionary summarizing item attribute makeup { label : % makeup of all labels }
    '''
    try: items[0][0]
    except: items = [[item] for item in items]

    arranged = []
    scores = {}
    for item in items:
        arranged.append({
            item[i]["label"] : item[i]["score"]
            for i in range(len(item))
        })
        scores[item[0]["label"]] = scores.get(item[0]["label"], 0) + item[0]["score"]
    score_sum = sum(scores.values())
    scores = { k : round(v / score_sum, 3) for k, v in scores.items() }
    return (arranged, scores)

def get_post_weight(post: dict) -> float:
    ''' Returns impression score (views * 0.1 + likes + retweets * 2.0 + comments * 1.5) '''
    try:
        return int(post["views"]) * 0.01 + int(post["likes"]) * 0.2 + int(post["retweets"]) * 0.5 + int(post["replies"]) * 0.3
    except:
        print("Provided post missing required post data")
        return 1

def analyze_word_frequencies(posts: dict):
    ''' Analyze a collection of tweet objects, return a dictionary of word frequency analysis '''
    tweets = []
    weights = []
    for post in posts.values():
        txt = html.unescape(str(post["contents"]).split("https://")[0]).lower().replace("’", "'")
        tweets.append(unidecode(unicodedata.normalize("NFKD", txt)).replace('\n', ' ').strip())
        weights.append(get_post_weight(post))

    word_freq = adv.word_frequency(text_list=tweets, num_list=weights)
    bigram_freq = adv.word_frequency(text_list=tweets, phrase_len=2, num_list=weights)

    # filter out words i dont care about + weird blank thing
    filtered = ["and", "is", "a"]
    word_freq = word_freq[~word_freq.word.isin(filtered + [""])]
    pattern ='|'.join(r'\b{}\b'.format(word) for word in filtered)
    bigram_freq = bigram_freq[~bigram_freq.word.str.contains(pattern)]

    word_freq = word_freq.sort_values(by=['abs_freq', 'rel_value'], ascending=[False, False]).reset_index(drop=True)
    bigram_freq = bigram_freq.sort_values(by=['abs_freq', 'rel_value'], ascending=[False, False]).reset_index(drop=True)
    words = word_freq.head(30).to_dict('index')
    bigrams = bigram_freq.head(30).to_dict('index')
    return { "words" : words, "bigrams" : bigrams }


# actual API interactions
def getAccountAnalysis(accountHandle:str, reload_analysis:bool = False):
    """ Return Twitter account analysis

        This includes basic sentiment analysis (positivity + valence), as well
            as detecting toxic content posted. It also includes a summary of the 
            account's content overall. """

    # first check if cached result exists...
    accountData = getAccountData(accountHandle)
    account_id = accountData["profile"]["accountID"]
    if not reload_analysis:
        cached = db.child("Analysis").child(account_id).get().val()
        if cached is not None:
            print("Found cached data in Firebase")
            return {
                "profile" : accountData["profile"],
                "analysis" : cached
            }

    # first get base account data + initialize models used
    print(f"Generating new analysis of user: {accountHandle}")
    img_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    img_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    sentiment_pipeline = pipeline("text-classification", model=BASE_MODEL)
    irony_pipeline = pipeline("text-classification", model=IRONY_MODEL)
    topic_pipeline = pipeline("text-classification", model=TOPIC_MODEL, top_k=5)
    emotion_pipeline = pipeline("text-classification", model=EMOTION_MODEL, top_k=3)
    offensive_pipeline = pipeline("text-classification", model=OFFENSIVE_MODEL)
    hate_pipeline = pipeline("text-classification", model=HATE_MODEL)

    # get full context of each post (image desc & quote tweets if applicable)
    posts = accountData["posts"]
    contexts = {}
    i = 0
    for id, post in posts.items():
        contexts[id] = get_post_content(post, img_processor, img_model)
        i += 1
        print(f"   [ {i} / {MAX_POSTS_FROM_API} posts parsed ]")

    # use models to get analyses of posts
    sentiments = sentiment_pipeline(list(map(lambda x : post_stringify(x), contexts.values())))
    irony = irony_pipeline(list(map(lambda x : post_stringify(x, True), contexts.values())))
    topics = topic_pipeline(list(map(lambda x : post_stringify(x, True), contexts.values())))
    emotions = emotion_pipeline(list(map(lambda x : post_stringify(x), contexts.values())))
    offensives = offensive_pipeline(list(map(lambda x : post_stringify(x, True), contexts.values())))
    hates = hate_pipeline(list(map(lambda x : post_stringify(x), contexts.values())))

    sentiments_arranged, sentiment_scores = get_label_summary(sentiments)
    topics_arranged, topic_scores = get_label_summary(topics)
    emotions_arranged, emotion_scores = get_label_summary(emotions)
    _, irony_scores = get_label_summary(irony)
    _, offensive_scores = get_label_summary(offensives)
    _, hate_scores = get_label_summary(hates)
    i = 0
    for id in posts.keys():
        posts[id].update({
            "context" : contexts[id],
            "sentiment" : sentiments_arranged[i],
            "topics" : topics_arranged[i],
            "emotions" : emotions_arranged[i],
            "irony" : irony[i],
            "offensive" : offensives[i],
            "hate" : hates[i]
        })
        i += 1
    
    freqs = analyze_word_frequencies(posts)
    analysis = {
        "sentiment" : sentiment_scores,
        "topics" : topic_scores,
        "emotions" : emotion_scores,
        "irony" : irony_scores,
        "offensive" : offensive_scores,
        "hate" : hate_scores,
        "word_frequencies" : freqs,
    }
    db.child("Analysis").child(account_id).set(analysis, token)
    db.child("TopPosts").child(account_id).update(posts, token)
    accountData["analysis"] = analysis
    accountData["posts"].update(posts)
    return {
        "profile" : accountData["profile"],
        "analysis" : analysis,
    }

def getAccountData(accountHandle:str, reload_data:bool = False):
    # TODO: first check if account even exists...
        # if not, don't waste time/API costs doing this stuff...

    # check firestore DB, if cached
    if not reload_data:
        cached = db.child("Accounts").child(accountHandle).get().val()
        if cached is not None:
            print("Found cached data in Firebase")
            return {
                "profile" : cached,
                "posts" : db.child("TopPosts").child(cached["accountID"]).get().val()
            }
    # if no valid entry or forced reload, get most relevant posts from that account
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
            pass

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

            try:
                post["quote"]["post"]["media_url"] = tweet["extended_entities"]["media"][0]["media_url_https"]
            except:
                pass
        except:
            pass

        data["posts"][item["id"]] = post

    # once finished parsing API response, cache profile + posts in Firebase (with last updated date)
    db.child("Accounts").child(accountHandle).update(data["profile"], token)
    db.child("TopPosts").child(data["profile"]["accountID"]).update(data["posts"], token)
    return data
    
def backend_listener():
    print("     Listening for incoming API/analysis requests")

    # TODO: should listen for requests in Firebase table "Requests"

    # if active requests, pop top one (FIFO) 
        # do twitter API request if no data
        # else do analysis

# this is just a little manager console allowing manual or automatic running of the data manipulation
if __name__ == '__main__':
    try:
        # the way I have the database set up, only my admin account has write permissions
        pword = getpass("Please authenticate w/ Firebase: ")
        user = firebase.auth().sign_in_with_email_and_password("calebhenry7095@gmail.com", pword)
        token = user["idToken"]
    except Exception as error:
        print("   Invalid login.")
        exit()
    mode = input("\nManual (0) or automatic (1) mode? ")
    if mode == '0':
        while True:
            username = input("Enter account username (or nothing to exit): ")
            if len(username) == 0:
                exit()
            choice = input("(0) Scrape or (1) analyze account?: ")
            force_reload = bool(input("   Force reload of data? (1) y or (0) n: "))
            if choice == '0':
                getAccountData(username, force_reload)
            else:
                getAccountAnalysis(username, force_reload)
    elif mode == '1':
        backend_listener()
    else:
        print("Unrecognized input")