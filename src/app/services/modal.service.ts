import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: Map<string, IModal | null> = new Map<string, IModal>();

  constructor() {

  }

  isModalOpen(id: string): boolean {
    return this.modals.get(id)?.visible ?? false
  }

  toggleModal = (id: string) => {
    let modal = this.modals.get(id)
    if (modal) {
      modal.visible = !modal.visible;
    }
  }

  register(id: string): void {
    this.modals.set(id, {
      id: id,
      visible: false
    })

    console.log(this.modals)
  }

  unregister(id: string) {
    this.modals.set(id, null)
  }
}
