import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { VirtualTimeScheduler } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showAlert = false
  alertMsg?: string
  alertColor?: string
  inSubmission = false

  credentials = {
    email: '',
    password: ''
  }

  constructor(private auth: AngularFireAuth) {
    this.setInitialAlertValues()
  }

  async login() {
    this.showAlert = true
    this.setInitialAlertValues()
    this.inSubmission = true

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email, this.credentials.password
      )
    } catch (e) {
      this.inSubmission = false
      this.alertMsg = 'An unexpected error occurred. Please try again later.'
      this.alertColor = 'red'

      console.log(e)
      return
    }

    this.alertMsg = 'You\'re logged in.'
    this.alertColor = 'green'
  }

  setInitialAlertValues() {
    this.alertMsg = 'Please wait! We\'re logging you in.'
    this.alertColor = 'blue'
  }
}
