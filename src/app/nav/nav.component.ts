import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  constructor(
    public auth: AuthService,
    public modal: ModalService) { }

  openModal(e: Event) {
    e.preventDefault() // prevent refresh from browser

    this.modal.toggleModal('auth');
  }
}
