import { Component,ChangeDetectionStrategy, signal } from '@angular/core';

import {} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

// import { NgOptimizedImage } from '@angular/common'

@Component({
  selector: 'app-atencion-a-clientes',
  imports: [MatExpansionModule,],
  templateUrl: './atencion-a-clientes.html',
  styleUrl: './atencion-a-clientes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class AtencionAClientes {
 readonly panelOpenState = signal(false);

 
}
