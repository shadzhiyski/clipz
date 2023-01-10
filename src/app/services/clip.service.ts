import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { map, of, switchMap } from 'rxjs';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>

  constructor(
      private db: AngularFirestore,
      private afAuth: AngularFireAuth) {
    this.clipsCollection = db.collection('clips')
  }

  createClip(data: IClip) : Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)
  }

  getUserClips() {
    return this.afAuth.user.pipe(
      switchMap(user => {
        if (!user) {
          return of([])
        }

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }
}
