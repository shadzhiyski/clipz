import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl<string>('', [
      Validators.required,
      Validators.email
    ]),
    age: new FormControl<number | null>(null,[
      Validators.required,
      Validators.min(18)
    ]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
    ]),
    confirm_password: new FormControl<string>('',[
      Validators.required
    ]),
    phoneNumber: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13)
    ]),
  });

  showAlert = false
  alertMsg?: string
  alertColor?: string
  inSubmission = false

  constructor(private auth: AuthService) {
    this.setInitialAlertValues();
  }

  async register() {
    this.showAlert = true
    this.alertMsg = 'Please wait! Your account is being created'
    this.alertColor = 'blue'
    this.inSubmission = true

    // const { email, password} = this.registerForm.value

    try {
      await this.auth.createUser(this.registerForm.value as IUser)

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
