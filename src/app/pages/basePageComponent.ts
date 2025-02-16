import { Directive } from '@angular/core';
import { UnsubscribingBaseComponent } from '../components/shared/unsubscribingBaseComponent';

@Directive()
export abstract class BasePageComponent extends UnsubscribingBaseComponent{
  constructor() {
    super();
  }

}
