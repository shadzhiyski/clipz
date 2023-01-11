import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  @Input() activeClip: IClip | null = null
  @Output() update = new EventEmitter()

  inSubmission = false
  showAlert = false
  alertColor?: string
  alertMsg?:string

  clipId = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ])
  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ])
  editForm = new FormGroup({
    title: this.title,
    id: this.clipId
  })

  constructor(
      private modal: ModalService,
      private clipService: ClipService) {
    this.setDefaultAlertValues()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = false
    this.showAlert = false
    this.clipId.setValue(this.activeClip.docId ?? null)
    this.title.setValue(this.activeClip.title)
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  async submit() {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = true
    this.showAlert = true
    this.setDefaultAlertValues()

    try {
      await this.clipService.updateClip(this.clipId.value as string, this.title.value as string)
    } catch(e) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Update failed. try again later.'
      return
    }

    this.activeClip.title = this.title.value as string
    this.update.emit(this.activeClip)

    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Update successful'
  }

  setDefaultAlertValues() {
    this.alertColor = 'blue'
    this.alertMsg = 'Updating Clip..'
  }

}
