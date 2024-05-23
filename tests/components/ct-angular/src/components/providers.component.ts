import { Component, inject, Injectable, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Store {
  actions = new Subject()

  state = {
    text: `Store`
  }

  dispatch(action: any) {
    this.actions.next(action)
  }
}

@NgModule({
  providers: [Store]
})
export class StoreModule {}

class Message {
  hello = true
}

@Component({
  standalone: true,
  selector: 'app-imports',
  template: `
    {{ provider?.state.text }}: from provider
    {{ environmentProvider?.state.text }}: from environmentProvider
  `
})
export class ProvidersComponent {
  provider = inject(Store, { self: true, optional: true })
  environmentProvider = inject(Store, { skipSelf: true, optional: true })

  constructor(http: HttpClient) {
    this.provider?.dispatch(new Message)
    this.environmentProvider?.dispatch(new Message)
  }
}
