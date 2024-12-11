# this is just so I can fiddle around with the configuration of everything in a low stakes environment
from transformers import pipeline
import numpy as np
import json

BASE_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
IRONY_MODEL = "cardiffnlp/twitter-roberta-base-irony"
TOPIC_MODEL = "cardiffnlp/tweet-topic-latest-multi"
EMOTION_MODEL = "cardiffnlp/twitter-roberta-base-emotion-multilabel-latest"
OFFENSIVE_MODEL = "cardiffnlp/twitter-roberta-base-offensive"
HATE_MODEL = "cardiffnlp/twitter-roberta-large-hate-latest"
SUMMARIZER = "facebook/bart-large-cnn"

contexts = {
    "1" : "hello world, this is a coding test. i have been working on some coding projects recently",
    "2" : "I definitely hate basketball, this is totally a serious post. I'm definitely not joking, that'd be crazy...",
    "3" : "Loving life right now!!!! feeling awesome :)",
    "4" : "Who decided that having doors was a good idea???",
    "5" : "De'Aaron Fox had 60 points today, wow #lightthebeam",
    "6" : "I don't have a lot of hate in my heart, but I am not a Rudy Gobert fan",
    "7" : "Please can we start Keon Ellis why is he not playing minutes..."
}

def get_label_summary(items):
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
    scores = { k : round(v / score_sum, 4) for k, v in scores.items() }
    return (arranged, scores)

def huggingface_models():
    sentiment_pipeline =  pipeline("text-classification", model=BASE_MODEL, top_k=3)
    irony_pipeline = pipeline("text-classification", model=IRONY_MODEL)
    topic_pipeline = pipeline("text-classification", model=TOPIC_MODEL, top_k=3)
    emotion_pipeline = pipeline("text-classification", model=EMOTION_MODEL, top_k=3)
    offensive_pipeline = pipeline("text-classification", model=OFFENSIVE_MODEL)
    hate_pipeline = pipeline("text-classification", model=HATE_MODEL)
    summarizer = pipeline("summarization", model=SUMMARIZER)

    sentiments = sentiment_pipeline(list(contexts.values()))
    irony = irony_pipeline(list(contexts.values()))
    topics = topic_pipeline(list(contexts.values()))
    emotions = emotion_pipeline(list(contexts.values()))
    offensives = offensive_pipeline(list(contexts.values()))
    hates = hate_pipeline(list(contexts.values()))
    posts = ' '.join([f'Post: { contexts[id] }' for id in contexts])
    summary = summarizer(f"Summarize this account based on their posts: { posts }", max_length=50, min_length=10, do_sample=False)

    sentiments_arranged, sentiment_scores = get_label_summary(sentiments)
    topics_arranged, topic_scores = get_label_summary(topics)
    emotions_arranged, emotion_scores = get_label_summary(emotions)
    _, irony_scores = get_label_summary(irony)
    _, offensive_scores = get_label_summary(offensives)
    _, hate_scores = get_label_summary(hates)
    print(json.dumps({
        "profile" : {
            "summary" : summary,
            "hate_scores" : hate_scores,
            "irony_scores" : irony_scores,
            "offensive_scores" : offensive_scores,
            "sentiment_scores" : sentiment_scores,
            "topic_scores" : topic_scores,
            "emotion_scores" : emotion_scores
        },
        "offensive": offensives,
        "hate" : hates,
        "irony" : irony
    }, indent=3, default=str))

def main():
    huggingface_models()

if __name__ == "__main__":
    main()