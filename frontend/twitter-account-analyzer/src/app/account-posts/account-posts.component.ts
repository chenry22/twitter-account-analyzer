import { Component, Injectable, 
  Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Account, Post } from '../account-data';
import { Database, ref, get, query,
  orderByChild, endAt, limitToLast} from '@angular/fire/database'

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// how many posts are loaded per request (max)
const POSTS_PER_LOAD = 10

@Injectable({providedIn: 'root'})
export class PostsDataService {
  constructor(private db: Database) {}
  accountID: string = ""
  maxLikes: number = Number.MAX_VALUE
  posts: Map<String, Post> = new Map<String, Post>()

  async getPosts(accountID: string): Promise<Array<Post> | null> {
    if(accountID != this.accountID){
      this.posts.clear()
      this.maxLikes = Number.MAX_VALUE
    }
    this.accountID = accountID;

    const postsQuery = query(ref(this.db, "TopPosts/" + accountID),
      orderByChild("likes"), endAt(this.maxLikes), limitToLast(POSTS_PER_LOAD))
    const snapshot = await get(postsQuery)
    if(snapshot.exists()){
      var min = this.maxLikes
      var newPosts = snapshot.val()
      Object.keys(newPosts).forEach((id) => {
        this.posts.set(id, newPosts[id])
        if(newPosts[id].likes < min){
          min = newPosts[id].likes
        }
      })
      this.maxLikes = min
      return Array.from(this.posts.values()).sort((a, b) => a.likes - b.likes).reverse()
    }
    return null;
  }
}

@Component({
  selector: 'account-posts',
  imports: [MatCardModule, MatIconModule, MatButtonModule,
    NgIf, NgFor],
  templateUrl: './account-posts.component.html',
  styleUrl: './account-posts.component.css'
})
export class AccountPostsComponent implements OnChanges {
  constructor(private postData: PostsDataService) { }
  @Input() username: string = ""
  @Input() accountData: Account | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['accountData'].currentValue){
      this.loadPosts(changes['accountData'].currentValue)
    }
  }

  posts: Array<Post> = []
  loadPosts(accountData: Account) {
    this.postData.getPosts(accountData.accountID).then((posts) => {
      if(posts != null){
        console.log(posts)
        this.posts = posts
      }
    })
  }

  numFormat(x: number): string {
    if(x < 1000){
      return x.toString()
    } else if(x < 1000000){
      return (x / 1000.0).toFixed(1).toString() + "k"
    } else {
      return (x / 1000000.0).toFixed(2).toString() + "M"
    }
  }
}
