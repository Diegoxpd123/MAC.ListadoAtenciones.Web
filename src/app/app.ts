import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';



@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatTabsModule,
    MatExpansionModule,

],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})




export class App{
  protected readonly title = signal('MAC.ListadoAtenciones.Web');


}


