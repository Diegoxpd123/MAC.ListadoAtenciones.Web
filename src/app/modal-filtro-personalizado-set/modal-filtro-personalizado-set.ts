import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ParametrosService, ListaGenericaDto } from '../service/parametros.service';

export interface SetConAlimentadores extends ListaGenericaDto {
  expandida: boolean;
  alimentadores: ListaGenericaDto[];
}

@Component({
  selector: 'app-modal-filtro-personalizado-set',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './modal-filtro-personalizado-set.html',
  styleUrl: './modal-filtro-personalizado-set.scss',
})
export class ModalFiltroPersonalizadoSet implements OnInit {
  private dialogRef = inject(DialogRef, {optional: true});
  private parametrosService = inject(ParametrosService);
  private cdr = inject(ChangeDetectorRef);

  // Estructura jerárquica de datos
  readonly sets = signal<SetConAlimentadores[]>([]);
  
  // Selecciones del usuario
  selecciones = {
    sets: [] as string[],
    alimentadores: [] as string[]
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected closeModal(): void {
    this.dialogRef?.close();
  }

  protected aceptar(): void {
    console.log('Selecciones SET y Alim:', this.selecciones);
    this.dialogRef?.close(this.selecciones);
  }

  /**
   * Carga los datos de SET
   */
  private cargarDatos(): void {
    this.parametrosService.listarParametro({ Sets: 0 }).subscribe({
      next: (response) => {
        if (response.codigo === 1 && response.entidad && response.entidad['Sets']) {
          const setsData: SetConAlimentadores[] = response.entidad['Sets'].map((item: ListaGenericaDto) => ({
            ...item,
            expandida: false,
            alimentadores: []
          }));
          this.sets.set(setsData);
          this.cdr.markForCheck();
        } else {
          // Datos de ejemplo si no hay datos
          const datosEjemplo: SetConAlimentadores[] = [
            {
              codigo: '1',
              descripcion: 'SET 001 - Zona Norte',
              valorAlf: 'SET001',
              expandida: false,
              alimentadores: []
            },
            {
              codigo: '2',
              descripcion: 'SET 002 - Zona Sur',
              valorAlf: 'SET002',
              expandida: false,
              alimentadores: []
            },
            {
              codigo: '3',
              descripcion: 'SET 003 - Zona Centro',
              valorAlf: 'SET003',
              expandida: false,
              alimentadores: []
            }
          ];
          this.sets.set(datosEjemplo);
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error al cargar datos SET:', error);
        // Datos de ejemplo en caso de error
        const datosEjemplo: SetConAlimentadores[] = [
          {
            codigo: '1',
            descripcion: 'SET 001 - Zona Norte',
            valorAlf: 'SET001',
            expandida: false,
            alimentadores: []
          },
          {
            codigo: '2',
            descripcion: 'SET 002 - Zona Sur',
            valorAlf: 'SET002',
            expandida: false,
            alimentadores: []
          }
        ];
        this.sets.set(datosEjemplo);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Expande/colapsa un SET y carga sus alimentadores si es necesario
   */
  protected toggleSet(set: SetConAlimentadores): void {
    set.expandida = !set.expandida;
    
    // Si se expande y no tiene alimentadores cargados, cargarlos
    if (set.expandida && set.alimentadores.length === 0) {
      this.cargarAlimentadores(set);
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Carga los alimentadores de un SET
   */
  private cargarAlimentadores(set: SetConAlimentadores): void {
    this.parametrosService.listarParametro({ Alimentaciones: 0 }).subscribe({
      next: (response) => {
        if (response.codigo === 1 && response.entidad && response.entidad['Alimentaciones']) {
          // Filtrar alimentadores por SET (si hay relación) o mostrar todos
          set.alimentadores = response.entidad['Alimentaciones'];
          // Actualizar el signal para forzar la detección de cambios
          this.sets.set([...this.sets()]);
          this.cdr.markForCheck();
        } else {
          // Datos de ejemplo si no hay alimentadores
          set.alimentadores = [
            { codigo: '1', descripcion: 'ALIM 001 - Alimentador Principal', valorAlf: 'ALIM001' },
            { codigo: '2', descripcion: 'ALIM 002 - Alimentador Secundario', valorAlf: 'ALIM002' },
            { codigo: '3', descripcion: 'ALIM 003 - Alimentador de Respaldo', valorAlf: 'ALIM003' }
          ];
          this.sets.set([...this.sets()]);
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error al cargar alimentadores:', error);
        // Datos de ejemplo en caso de error
        set.alimentadores = [
          { codigo: '1', descripcion: 'ALIM 001 - Alimentador Principal', valorAlf: 'ALIM001' },
          { codigo: '2', descripcion: 'ALIM 002 - Alimentador Secundario', valorAlf: 'ALIM002' }
        ];
        this.sets.set([...this.sets()]);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Maneja el cambio en el checkbox de SET
   */
  protected onSetChange(codigo: string, checked: boolean): void {
    if (checked) {
      if (!this.selecciones.sets.includes(codigo)) {
        this.selecciones.sets.push(codigo);
      }
    } else {
      this.selecciones.sets = this.selecciones.sets.filter(s => s !== codigo);
      // Desmarcar alimentadores relacionados
      const set = this.sets().find(s => s.codigo === codigo);
      if (set) {
        set.alimentadores.forEach(alim => {
          this.selecciones.alimentadores = this.selecciones.alimentadores.filter(a => a !== alim.codigo);
        });
      }
    }
  }

  /**
   * Maneja el cambio en el checkbox de Alimentador
   */
  protected onAlimentadorChange(codigo: string, checked: boolean): void {
    if (checked) {
      if (!this.selecciones.alimentadores.includes(codigo)) {
        this.selecciones.alimentadores.push(codigo);
      }
    } else {
      this.selecciones.alimentadores = this.selecciones.alimentadores.filter(a => a !== codigo);
    }
  }

  /**
   * Verifica si un SET está seleccionado
   */
  protected isSetSelected(codigo: string): boolean {
    return this.selecciones.sets.includes(codigo);
  }

  /**
   * Verifica si un Alimentador está seleccionado
   */
  protected isAlimentadorSelected(codigo: string): boolean {
    return this.selecciones.alimentadores.includes(codigo);
  }
}

