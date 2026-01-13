import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ParametrosService, ListaGenericaDto } from '../service/parametros.service';

export interface ClasificacionConTipos extends ListaGenericaDto {
  expandida: boolean;
  tipos: TipoConSubtipos[];
}

export interface TipoConSubtipos extends ListaGenericaDto {
  expandida: boolean;
  subtipos: ListaGenericaDto[];
  idClasificacion?: string;
}

@Component({
  selector: 'app-modal-filtro-personalizado-clasificaciones',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './modal-filtro-personalizado-clasificaciones.html',
  styleUrl: './modal-filtro-personalizado-clasificaciones.scss',
})
export class ModalFiltroPersonalizadoClasificaciones implements OnInit {
  private dialogRef = inject(DialogRef, {optional: true});
  private parametrosService = inject(ParametrosService);
  private cdr = inject(ChangeDetectorRef);

  // Estructura jerárquica de datos
  readonly clasificaciones = signal<ClasificacionConTipos[]>([]);
  
  // Selecciones del usuario
  selecciones = {
    clasificaciones: [] as string[],
    tipos: [] as string[],
    subtipos: [] as string[]
  };

  ngOnInit(): void {
    this.cargarClasificaciones();
  }

  protected closeModal(): void {
    this.dialogRef?.close();
  }

  protected aceptar(): void {
    // Aquí se pueden procesar las selecciones antes de cerrar
    console.log('Selecciones:', this.selecciones);
    this.dialogRef?.close(this.selecciones);
  }

  /**
   * Carga las clasificaciones iniciales
   */
  private cargarClasificaciones(): void {
    this.parametrosService.listarParametro({ Clasificaciones: 0 }).subscribe({
      next: (response) => {
        if (response.codigo === 1 && response.entidad && response.entidad['Clasificaciones']) {
          const clasificacionesData: ClasificacionConTipos[] = response.entidad['Clasificaciones'].map((item: ListaGenericaDto) => ({
            ...item,
            expandida: false,
            tipos: []
          }));
          this.clasificaciones.set(clasificacionesData);
          this.cdr.markForCheck();
        } else {
          // Datos de ejemplo si no hay datos
          const datosEjemplo: ClasificacionConTipos[] = [
            {
              codigo: '1',
              descripcion: 'APC - ÁREA DE PRESUPUESTOS Y CONEXIONES',
              valorAlf: 'APC',
              expandida: false,
              tipos: []
            },
            {
              codigo: '2',
              descripcion: 'C - CONSULTAS',
              valorAlf: 'C',
              expandida: false,
              tipos: []
            }
          ];
          this.clasificaciones.set(datosEjemplo);
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error al cargar clasificaciones:', error);
        // Datos de ejemplo en caso de error
        const datosEjemplo: ClasificacionConTipos[] = [
          {
            codigo: '1',
            descripcion: 'APC - ÁREA DE PRESUPUESTOS Y CONEXIONES',
            valorAlf: 'APC',
            expandida: false,
            tipos: []
          },
          {
            codigo: '2',
            descripcion: 'C - CONSULTAS',
            valorAlf: 'C',
            expandida: false,
            tipos: []
          }
        ];
        this.clasificaciones.set(datosEjemplo);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Expande/colapsa una clasificación y carga sus tipos si es necesario
   */
  protected toggleClasificacion(clasificacion: ClasificacionConTipos): void {
    clasificacion.expandida = !clasificacion.expandida;
    
    // Si se expande y no tiene tipos cargados, cargarlos
    if (clasificacion.expandida && clasificacion.tipos.length === 0) {
      this.cargarTipos(clasificacion);
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Carga los tipos de una clasificación
   */
  private cargarTipos(clasificacion: ClasificacionConTipos): void {
    const idClasificacion = parseInt(clasificacion.codigo);
    this.parametrosService.listarParametro({ Tipos: idClasificacion }).subscribe({
      next: (response) => {
        if (response.codigo === 1 && response.entidad && response.entidad['Tipos']) {
          const tiposData: TipoConSubtipos[] = response.entidad['Tipos'].map((item: ListaGenericaDto) => ({
            ...item,
            expandida: false,
            subtipos: [],
            idClasificacion: clasificacion.codigo
          }));
          clasificacion.tipos = tiposData;
          // Actualizar el signal para forzar la detección de cambios
          this.clasificaciones.set([...this.clasificaciones()]);
          this.cdr.markForCheck();
        } else {
          // Datos de ejemplo si no hay tipos
          const tiposEjemplo: TipoConSubtipos[] = [
            {
              codigo: '1',
              descripcion: 'M - MASIVOS',
              valorAlf: 'M',
              expandida: false,
              subtipos: [],
              idClasificacion: clasificacion.codigo
            },
            {
              codigo: '2',
              descripcion: 'R - RUTINA',
              valorAlf: 'R',
              expandida: false,
              subtipos: [],
              idClasificacion: clasificacion.codigo
            }
          ];
          clasificacion.tipos = tiposEjemplo;
          this.clasificaciones.set([...this.clasificaciones()]);
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error al cargar tipos:', error);
        // Datos de ejemplo en caso de error
        const tiposEjemplo: TipoConSubtipos[] = [
          {
            codigo: '1',
            descripcion: 'M - MASIVOS',
            valorAlf: 'M',
            expandida: false,
            subtipos: [],
            idClasificacion: clasificacion.codigo
          }
        ];
        clasificacion.tipos = tiposEjemplo;
        this.clasificaciones.set([...this.clasificaciones()]);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Expande/colapsa un tipo y carga sus subtipos si es necesario
   */
  protected toggleTipo(tipo: TipoConSubtipos, clasificacion: ClasificacionConTipos): void {
    tipo.expandida = !tipo.expandida;
    
    // Si se expande y no tiene subtipos cargados, cargarlos
    if (tipo.expandida && tipo.subtipos.length === 0) {
      this.cargarSubtipos(tipo);
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Carga los subtipos de un tipo
   */
  private cargarSubtipos(tipo: TipoConSubtipos): void {
    const idTipoPedido = parseInt(tipo.codigo);
    this.parametrosService.listarParametro({ SubTipos: idTipoPedido }).subscribe({
      next: (response) => {
        if (response.codigo === 1 && response.entidad && response.entidad['SubTipos']) {
          tipo.subtipos = response.entidad['SubTipos'];
          // Actualizar el signal para forzar la detección de cambios
          this.clasificaciones.set([...this.clasificaciones()]);
          this.cdr.markForCheck();
        } else {
          // Datos de ejemplo si no hay subtipos
          tipo.subtipos = [
            { codigo: '1', descripcion: '1 - ENTREGA DE DOCUMENTOS EN INFORMACION', valorAlf: '1' },
            { codigo: '2', descripcion: '2 - INSPECCIÓN DE LOTESICASTASTROI', valorAlf: '2' },
            { codigo: '3', descripcion: '3 - ENTREGA Y PAGO DE PPTOS', valorAlf: '3' }
          ];
          this.clasificaciones.set([...this.clasificaciones()]);
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error al cargar subtipos:', error);
        // Datos de ejemplo en caso de error
        tipo.subtipos = [
          { codigo: '1', descripcion: '1 - ENTREGA DE DOCUMENTOS EN INFORMACION', valorAlf: '1' },
          { codigo: '2', descripcion: '2 - INSPECCIÓN DE LOTESICASTASTROI', valorAlf: '2' }
        ];
        this.clasificaciones.set([...this.clasificaciones()]);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Maneja el cambio en el checkbox de clasificación
   */
  protected onClasificacionChange(codigo: string, checked: boolean): void {
    if (checked) {
      if (!this.selecciones.clasificaciones.includes(codigo)) {
        this.selecciones.clasificaciones.push(codigo);
      }
    } else {
      this.selecciones.clasificaciones = this.selecciones.clasificaciones.filter(c => c !== codigo);
      // Desmarcar tipos y subtipos relacionados
      const clasificacion = this.clasificaciones().find(c => c.codigo === codigo);
      if (clasificacion) {
        clasificacion.tipos.forEach(tipo => {
          this.selecciones.tipos = this.selecciones.tipos.filter(t => t !== tipo.codigo);
          this.selecciones.subtipos = this.selecciones.subtipos.filter(s => {
            const subtipo = tipo.subtipos.find(st => st.codigo === s);
            return !subtipo;
          });
        });
      }
    }
  }

  /**
   * Maneja el cambio en el checkbox de tipo
   */
  protected onTipoChange(codigo: string, checked: boolean): void {
    if (checked) {
      if (!this.selecciones.tipos.includes(codigo)) {
        this.selecciones.tipos.push(codigo);
      }
    } else {
      this.selecciones.tipos = this.selecciones.tipos.filter(t => t !== codigo);
      // Desmarcar subtipos relacionados
      const tipo = this.clasificaciones()
        .flatMap(c => c.tipos)
        .find(t => t.codigo === codigo);
      if (tipo) {
        tipo.subtipos.forEach(subtipo => {
          this.selecciones.subtipos = this.selecciones.subtipos.filter(s => s !== subtipo.codigo);
        });
      }
    }
  }

  /**
   * Maneja el cambio en el checkbox de subtipo
   */
  protected onSubtipoChange(codigo: string, checked: boolean): void {
    if (checked) {
      if (!this.selecciones.subtipos.includes(codigo)) {
        this.selecciones.subtipos.push(codigo);
      }
    } else {
      this.selecciones.subtipos = this.selecciones.subtipos.filter(s => s !== codigo);
    }
  }

  /**
   * Verifica si una clasificación está seleccionada
   */
  protected isClasificacionSelected(codigo: string): boolean {
    return this.selecciones.clasificaciones.includes(codigo);
  }

  /**
   * Verifica si un tipo está seleccionado
   */
  protected isTipoSelected(codigo: string): boolean {
    return this.selecciones.tipos.includes(codigo);
  }

  /**
   * Verifica si un subtipo está seleccionado
   */
  protected isSubtipoSelected(codigo: string): boolean {
    return this.selecciones.subtipos.includes(codigo);
  }
}

