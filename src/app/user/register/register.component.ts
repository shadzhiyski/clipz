import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    age: new FormControl('',[
      Validators.required,
      Validators.min(18)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
    ]),
    confirm_password: new FormControl('',[
      Validators.required
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13)
    ]),
  });

  showAlert = false
  alertMsg?: string
  alertColor?: string
  inSubmission = false

  constructor(
      private auth: AngularFireAuth,
      private db: AngularFirestore) {
    this.setInitialAlertValues();
  }

  async register() {
    this.showAlert = true
    this.alertMsg = 'Please wait! Your account is being created'
    this.alertColor = 'blue'
    this.inSubmission = true

    const { email, password} = this.registerForm.value


    try {
      const userCred = await this.auth.createUserWithEmailAndPassword(
        email as string, password as string
      )

      await this.db.collection('users').add({
        name: this.registerForm.controls.name.value,
        email: this.registerForm.controls.email.value,
        age: this.registerForm.controls.age.value,
        phoneNumber: this.registerForm.controls.phoneNumber.value,
      })

    } catch (e) {
      this.alertMsg = 'An unexpected error occurred. Please try again later'
      this.alertColor = 'red'
      this.inSubmission = false
      return
    }

    this.alertMsg = 'Your account has been created'
    this.alertColor = 'green'
  }

  setInitialAlertValues() {
    this.alertMsg = 'Please wait! Your account is being created'
    this.alertColor = 'blue'
  }
}
