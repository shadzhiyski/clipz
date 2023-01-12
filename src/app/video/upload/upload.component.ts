import { Component, OnDestroy } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid'
import firebase from 'firebase/compat/app'
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragOver = false
  file: File | null = null
  nextStep = false

  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ])
  uploadForm = new FormGroup({
    title: this.title
  })

  showAlert = false
  alertColor?: string
  alertMsg?: string
  inSubmission = false

  percentage = 0
  showPercentage = false

  user: firebase.User | null = null
  task?: AngularFireUploadTask
  screenshotTask?: AngularFireUploadTask

  screenshots: string[] = []
  selectedScreenshot = ''

  constructor(
      private storage: AngularFireStorage,
      private afAuth: AngularFireAuth,
      private clipsService: ClipService,
      private router: Router,
      public ffmpegService: FfmpegService) {
    this.setInitialAlertValues()
    afAuth.user.subscribe(user => this.user = user)
    this.ffmpegService.init()
  }

  ngOnDestroy(): void {
    this.task?.cancel()
  }

  async storeFile(event: Event) {
    if (this.ffmpegService.isRunning) {
      return
    }

    this.isDragOver = false

    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file)
    this.selectedScreenshot = this.screenshots[0]

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )
    this.nextStep = true
  }

  async uploadFile() {
    this.uploadForm.disable()

    this.showAlert = true
    this.setInitialAlertValues()
    this.inSubmission = true
    this.showPercentage = true

    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`

    const screenshotBlob = await this.ffmpegService.blobFromUrl(this.selectedScreenshot)
    const screenshotPath = `screenshots/${clipFileName}.png`

    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob)
    const screenshotRef = this.storage.ref(screenshotPath)

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress
      if (!clipProgress || !screenshotProgress) {
        return
      }

      const totalProgress = clipProgress + screenshotProgress

      this.percentage = totalProgress as number / 200
    })

    forkJoin([
        this.task.snapshotChanges(),
        this.screenshotTask.snapshotChanges()
      ])
      .pipe(
        switchMap(() => forkJoin([
          clipRef.getDownloadURL(),
          screenshotRef.getDownloadURL()
        ]))
      )
      .subscribe({
        next: async (urls) => {

          const [ clipUrl, screenshotUrl ] = urls
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value as string,
            fileName: `${clipFileName}.mp4`,
            url: clipUrl,
            screenshotUrl,
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }

          const clipDocRef = await this.clipsService.createClip(clip)

          console.log(clip)

          this.alertColor = 'green'
          this.alertMsg = 'Your clip is uploaded'
          this.showPercentage = false

          setTimeout(() => {
            this.router.navigate([
              'clip', clipDocRef.id
            ])
          }, 1000)
        },
        error: (error) => {
          this.uploadForm.enable()

          this.alertColor = 'red'
          this.alertMsg = 'Upload failed! Please, try again later.'
          this.inSubmission = true
          this.showPercentage = false

          console.error(error)
        }
      })
  }

  private setInitialAlertValues() {
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Your clip is being uploaded.'
  }
}
