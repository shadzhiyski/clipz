import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
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
    public modal: ModalService,
    private afAuth: AngularFireAuth) { }

  openModal(e: Event) {
    e.preventDefault() // prevent refresh from browser

    this.modal.toggleModal('auth');
  }

  async logout(e: Event) {
    e.preventDefault()

    await this.afAuth.signOut();
  }
}
