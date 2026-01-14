import { Component, inject, OnInit, signal, ChangeDetectorRef, HostListener } from '@angular/core';
import { Api } from '../service/api';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { ParametrosService, ListaGenericaDto } from '../service/parametros.service';
import { ModalFiltroPersonalizadoClasificaciones } from '../modal-filtro-personalizado-clasificaciones/modal-filtro-personalizado-clasificaciones';
import { ModalFiltroPersonalizadoSet } from '../modal-filtro-personalizado-set/modal-filtro-personalizado-set';

@Component({
  selector: 'app-modal-filtro-avnazado',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './modal-filtro-avnazado.html',
  styleUrl: './modal-filtro-avnazado.scss',
})

export class ModalFiltroAvnazado implements OnInit {
  private dialogRef = inject(Dialog, {optional: true});
  private dialog = inject(Dialog);
  private parametrosService = inject(ParametrosService);
  private cdr = inject(ChangeDetectorRef);

  // Estado del multiselect de distritos
  readonly distritoDropdownAbierto = signal(false);
  readonly distritoBusqueda = signal('');
  readonly distritosFiltrados = signal<ListaGenericaDto[]>([]);

  // Listas para los desplegables del filtro avanzado - Datos de llamada
  readonly tipoIdLlamada = signal<ListaGenericaDto[]>([]);
  readonly descripciones = signal<ListaGenericaDto[]>([]);
  readonly distritos = signal<ListaGenericaDto[]>([]);
  readonly zonas = signal<ListaGenericaDto[]>([]);
  readonly tipoOrigenLlamada = signal<ListaGenericaDto[]>([]);
  readonly sucursales = signal<ListaGenericaDto[]>([]);
  readonly centrosServicio = signal<ListaGenericaDto[]>([]);
  readonly condicionesFecha = signal<ListaGenericaDto[]>([]);

  // Listas para los desplegables - Datos del predio
  readonly clasificaciones = signal<ListaGenericaDto[]>([]);
  readonly tiposPedido = signal<ListaGenericaDto[]>([]);
  readonly subTiposPedido = signal<ListaGenericaDto[]>([]);
  readonly estados = signal<ListaGenericaDto[]>([]);

  // Listas para los desplegables - Datos de eléctricos
  readonly sets = signal<ListaGenericaDto[]>([]);
  readonly alimentadores = signal<ListaGenericaDto[]>([]);

  // Opciones para el campo Fecha llamada
  readonly opcionesFecha = [
    { valor: '', texto: '-- Seleccionar --' },
    { valor: 'ninguno', texto: 'Ninguno' },
    { valor: 'desde', texto: 'Desde' },
    { valor: 'entre', texto: 'Entre' },
    { valor: 'igual', texto: 'Igual' },
    { valor: 'hasta', texto: 'Hasta' }
  ];

  // Formulario de filtros
  filtro = {
    distritos: [] as string[], // Array para múltiple selección
    opcionFecha: '', // Opción seleccionada para fecha
    fechaDesde: '', // Fecha inicial (para "desde", "entre", "igual")
    fechaHasta: '', // Fecha final (para "entre", "hasta")
    filtroPersonalizadoPredio: false, // Checkbox filtro personalizado predio
    filtroPersonalizadoElectrico: false, // Checkbox filtro personalizado eléctrico
    clasificacion: '', // Clasificación
    tipoPedido: '', // Tipo pedido
    subTipoPedido: '', // Sub tipo pedido
    set: '', // SET
    alimentador: '', // Alimentador
  };

  // Mensaje de error para validación de fechas
  readonly errorFecha = signal<string>('');

  ngOnInit(): void {
    // Inicializar con datos de prueba si es necesario
    if (this.distritos().length === 0) {
      this.distritos.set([
        { codigo: '1', descripcion: 'Distrito 1', valorAlf: 'D1' },
        { codigo: '2', descripcion: 'Distrito 2', valorAlf: 'D2' },
        { codigo: '3', descripcion: 'Distrito 3', valorAlf: 'D3' },
        { codigo: '4', descripcion: 'Distrito 4', valorAlf: 'D4' },
        { codigo: '5', descripcion: 'Distrito 5', valorAlf: 'D5' }
      ]);
    }
    this.distritosFiltrados.set(this.distritos());
    this.cargarTodosLosParametros();
  }

  /**
   * Obtiene el texto a mostrar en el campo de distrito
   */
  protected obtenerTextoDistritos(): string {
    if (!this.filtro.distritos || this.filtro.distritos.length === 0) {
      return '-- Seleccionar --';
    }
    if (this.filtro.distritos.length === 1) {
      const distrito = this.distritos().find(d => d.codigo === this.filtro.distritos[0]);
      return distrito ? distrito.descripcion : '';
    }
    if (this.filtro.distritos.length > 1 && this.filtro.distritos.length <= 3) {
      return this.filtro.distritos
        .map(codigo => {
          const distrito = this.distritos().find(d => d.codigo === codigo);
          return distrito ? distrito.descripcion : '';
        })
        .filter(d => d)
        .join(', ');
    }
    return `${this.filtro.distritos.length} distritos seleccionados`;
  }

  /**
   * Verifica si un distrito está seleccionado
   */
  protected distritoEstaSeleccionado(codigo: string): boolean {
    return this.filtro.distritos.includes(codigo);
  }

  /**
   * Toggle de selección de distrito
   */
  protected toggleDistrito(codigo: string): void {
    const index = this.filtro.distritos.indexOf(codigo);
    if (index > -1) {
      this.filtro.distritos.splice(index, 1);
    } else {
      this.filtro.distritos.push(codigo);
    }
    this.cdr.detectChanges();
  }

  /**
   * Filtra los distritos según la búsqueda
   */
  protected filtrarDistritos(): void {
    const busqueda = this.distritoBusqueda().toLowerCase();
    if (!busqueda) {
      this.distritosFiltrados.set(this.distritos());
    } else {
      this.distritosFiltrados.set(
        this.distritos().filter(d =>
          d.descripcion.toLowerCase().includes(busqueda)
        )
      );
    }
  }

  /**
   * Abre/cierra el dropdown de distritos
   */
  protected toggleDistritoDropdown(): void {
    this.distritoDropdownAbierto.update(v => !v);
    if (this.distritoDropdownAbierto()) {
      this.distritoBusqueda.set('');
      this.distritosFiltrados.set(this.distritos());
    }
  }

  /**
   * Cierra el dropdown de distritos
   */
  protected cerrarDistritoDropdown(): void {
    this.distritoDropdownAbierto.set(false);
    this.distritoBusqueda.set('');
  }

  /**
   * Cierra el dropdown al hacer click fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-multiselect')) {
      this.cerrarDistritoDropdown();
    }
  }

  protected closeModal(): void {
    this.dialogRef?.closeAll();
  }

  /**
   * Carga todos los parámetros necesarios para el filtro avanzado
   */
  private cargarTodosLosParametros(): void {
    this.parametrosService.obtenerParametrosFiltroAvanzado().subscribe({
      next: (response) => {
        if (response.codigo === 1 && response.entidad) {
          // Cargar cada lista de parámetros
          if (response.entidad['TipoIdLlamada']) {
            this.tipoIdLlamada.set(response.entidad['TipoIdLlamada']);
          }
          if (response.entidad['Descripciones']) {
            this.descripciones.set(response.entidad['Descripciones']);
          }
          if (response.entidad['Distritos'] && response.entidad['Distritos'].length > 0) {
            this.distritos.set(response.entidad['Distritos']);
          } else {
            // Datos de prueba si no hay datos
            this.distritos.set([
              { codigo: '1', descripcion: 'Distrito 1', valorAlf: 'D1' },
              { codigo: '2', descripcion: 'Distrito 2', valorAlf: 'D2' },
              { codigo: '3', descripcion: 'Distrito 3', valorAlf: 'D3' },
              { codigo: '4', descripcion: 'Distrito 4', valorAlf: 'D4' },
              { codigo: '5', descripcion: 'Distrito 5', valorAlf: 'D5' }
            ]);
          }
          this.distritosFiltrados.set(this.distritos());
          if (response.entidad['ZonaLlamada']) {
            this.zonas.set(response.entidad['ZonaLlamada']);
          }
          if (response.entidad['TipoOrigenLLamada']) {
            this.tipoOrigenLlamada.set(response.entidad['TipoOrigenLLamada']);
          }
          if (response.entidad['Sucursales']) {
            this.sucursales.set(response.entidad['Sucursales']);
          }
          if (response.entidad['CentroDeServicio']) {
            this.centrosServicio.set(response.entidad['CentroDeServicio']);
          }
          if (response.entidad['FechaLlamada']) {
            this.condicionesFecha.set(response.entidad['FechaLlamada']);
          }
          // Datos del predio
          if (response.entidad['Clasificaciones']) {
            this.clasificaciones.set(response.entidad['Clasificaciones']);
          }
          if (response.entidad['Tipos']) {
            this.tiposPedido.set(response.entidad['Tipos']);
          }
          if (response.entidad['SubTipos']) {
            this.subTiposPedido.set(response.entidad['SubTipos']);
          }
          if (response.entidad['Estados']) {
            this.estados.set(response.entidad['Estados']);
          }
          // Datos de eléctricos
          if (response.entidad['Sets']) {
            this.sets.set(response.entidad['Sets']);
          }
          if (response.entidad['Alimentaciones']) {
            this.alimentadores.set(response.entidad['Alimentaciones']);
          }
          console.log('Parámetros del filtro avanzado cargados:', response);
          console.log('TipoIdLlamada:', this.tipoIdLlamada());
          console.log('Distritos:', this.distritos());
          // Forzar detección de cambios para OnPush
          this.cdr.markForCheck();
        } else {
          console.error('Error en la respuesta:', response.mensajeUsuario);
        }
      },
      error: (error) => {
        console.error('Error al cargar parámetros del filtro avanzado:', error);
      }
    });
  }


  /**
   * Verifica si se debe mostrar los dos inputs de calendario (cuando se selecciona "entre")
   */
  protected mostrarFechasEntre(): boolean {
    return this.filtro.opcionFecha === 'entre';
  }

  /**
   * Verifica si se debe mostrar un solo input de calendario para "desde" o "igual"
   */
  protected mostrarFechaUnica(): boolean {
    return ['desde', 'igual'].includes(this.filtro.opcionFecha);
  }

  /**
   * Verifica si se debe mostrar un solo input de calendario para "hasta"
   */
  protected mostrarFechaHasta(): boolean {
    return this.filtro.opcionFecha === 'hasta';
  }

  /**
   * Valida que la diferencia entre las dos fechas no sea mayor a 30 días
   */
  protected validarRangoFechas(): void {
    if (this.filtro.opcionFecha === 'entre') {
      if (this.filtro.fechaDesde && this.filtro.fechaHasta) {
        const fechaInicio = new Date(this.filtro.fechaDesde);
        const fechaFin = new Date(this.filtro.fechaHasta);

        // Calcular la diferencia en días
        const diferenciaMs = fechaFin.getTime() - fechaInicio.getTime();
        const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

        if (diferenciaDias > 30) {
          this.errorFecha.set('La diferencia entre las fechas no puede ser mayor a 30 días');
        } else if (diferenciaDias < 0) {
          this.errorFecha.set('La fecha final debe ser mayor o igual a la fecha inicial');
        } else {
          this.errorFecha.set('');
        }
      } else {
        this.errorFecha.set('');
      }
    } else {
      this.errorFecha.set('');
    }
    this.cdr.detectChanges();
  }

  /**
   * Maneja el cambio en la opción de fecha
   */
  protected onOpcionFechaChange(): void {
    // Limpiar fechas cuando cambia la opción
    if (this.filtro.opcionFecha !== 'entre' && this.filtro.opcionFecha !== 'hasta') {
      this.filtro.fechaHasta = '';
    }
    if (this.filtro.opcionFecha !== 'desde' && this.filtro.opcionFecha !== 'entre' && this.filtro.opcionFecha !== 'igual') {
      this.filtro.fechaDesde = '';
    }
    if (!['desde', 'entre', 'igual', 'hasta'].includes(this.filtro.opcionFecha)) {
      this.filtro.fechaDesde = '';
      this.filtro.fechaHasta = '';
    }
    this.errorFecha.set('');
  }

  /**
   * Maneja el cambio en el checkbox de filtro personalizado predio
   */
  protected onFiltroPersonalizadoPredioChange(checked: boolean): void {
    if (checked) {
      // Limpiar los valores de los selects relacionados
      this.filtro.clasificacion = '';
      this.filtro.tipoPedido = '';
      this.filtro.subTipoPedido = '';
    }
  }

  /**
   * Maneja el cambio en el checkbox de filtro personalizado eléctrico
   */
  protected onFiltroPersonalizadoElectricoChange(checked: boolean): void {
    if (checked) {
      // Limpiar los valores de los selects relacionados
      this.filtro.set = '';
      this.filtro.alimentador = '';
    }
  }

  /**
   * Abre el modal de filtro personalizado para clasificaciones (clasificaciones/tipos/subtipos)
   */
  protected abrirFiltroPersonalizadoPredio(): void {
    this.dialog.open(ModalFiltroPersonalizadoClasificaciones, { disableClose: true });
  }

  /**
   * Abre el modal de filtro personalizado para eléctricos (SET y Alim)
   */
  protected abrirFiltroPersonalizadoElectrico(): void {
    this.dialog.open(ModalFiltroPersonalizadoSet, { disableClose: true });
  }
}
