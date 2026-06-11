// status-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(options: { value: string; label: string }[], value: string): string {
    return options.find(o => o.value === value)?.label ?? value;
  }
}