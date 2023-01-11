import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  videoOrder = '1'
  clips: IClip[] = []
  activeClip: IClip | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService) { }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(map((params: Params) => params.params))
      .subscribe((params: Params) => {
        this.videoOrder = params.sort
      })

    this.clipService.getUserClips()
      .subscribe(docs => {
        this.clips = []

        docs.forEach(doc => {
          this.clips.push({
            docId: doc.id,
            ...doc.data()
          })
        })
      })
  }

  sort(event: Event) {
    const { value } = (event.target as HTMLSelectElement)

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    })
  }

  openModal(event: Event, clip: IClip) {
    event.preventDefault()

    this.activeClip = clip

    this.modal.toggleModal('editClip')
  }

  update(event: IClip) {
    this.clips.forEach((element, i) => {
      if (element.docId == event.docId) {
        this.clips[i].title = event.title
      }
    })
  }
}
