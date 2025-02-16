import { Directive, HostBinding, Input } from '@angular/core';
import { UnsubscribingBaseComponent } from './shared/unsubscribingBaseComponent';

@Directive()
export abstract class BaseAppComponent extends UnsubscribingBaseComponent{
  @Input() @HostBinding('class') class: string = '';

  constructor() {
    super();
  }
}
