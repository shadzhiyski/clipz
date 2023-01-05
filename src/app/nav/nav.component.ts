import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  constructor(public modal: ModalService) {

  }

  openModal(e: Event) {
    e.preventDefault() // prevent refresh from browser

    this.modal.toggleModal('auth');
  }
}
