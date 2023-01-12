import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>
  pageClips: IClip[] = []
  pendingReq = false

  constructor(
      private db: AngularFirestore,
      private afAuth: AngularFireAuth,
      private storage: AngularFireStorage,
      private router: Router) {
    this.clipsCollection = db.collection('clips')
  }

  createClip(data: IClip) : Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([
        this.afAuth.user,
        sort$
      ]).pipe(
        switchMap(values => {
          const [ user, sort ] = values
          if (!user) {
            return of([])
          }

          const query = this.clipsCollection.ref.where(
              'uid', '==', user.uid
            ).orderBy('timestamp', sort == '1' ? 'desc' : 'asc')

          return query.get()
        }),
        map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
      )
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({ title })
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`)
    const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFileName}`)

    await clipRef.delete()
    await screenshotRef.delete()

    await this.clipsCollection.doc(clip.docId).delete()
  }

  async getClips() {
    if (this.pendingReq) {
      return
    }

    this.pendingReq = true

    let query = this.clipsCollection.ref
      .orderBy('timestamp', 'desc')
      .limit(6)

    const { length } = this.pageClips
    if (length) {
      const lastDocId = this.pageClips[length - 1].docId
      const lastDoc = await firstValueFrom(
        this.clipsCollection.doc(lastDocId).get()
      )

      query = query.startAfter(lastDoc)
    }

    const snapshot = await query.get()
    snapshot.forEach(doc => {
      this.pageClips.push({
        docId: doc.id,
        ...doc.data()
      })
    })

    this.pendingReq = false
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection.doc(route.params.id)
      .get()
      .pipe(
        map(snapshot => {
          const data = snapshot.data()
          if (!data) {
            this.router.navigate(['/'])
            return null
          }

          return data
        })
      )
  }
}
