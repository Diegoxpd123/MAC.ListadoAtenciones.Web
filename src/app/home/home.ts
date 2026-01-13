import { Component, inject, OnInit, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { AtencionAClientes } from '../atencion-a-clientes/atencion-a-clientes';
import { ModalFiltroAvnazado } from '../modal-filtro-avnazado/modal-filtro-avnazado';
import { AuthService } from '../service/auth.service';
import { ParametrosService, ListaGenericaDto } from '../service/parametros.service';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, FormsModule, MatTabsModule, AtencionAClientes],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  readonly panelOpenState = signal(false);

  // Datos para los combos
  readonly tipoIdLlamada = signal<ListaGenericaDto[]>([]);
  readonly distritos = signal<ListaGenericaDto[]>([]);
  readonly sucursales = signal<ListaGenericaDto[]>([]);

  // Objeto para el formulario de filtros
  filtro = {
    codigoLlamada: '',
    tipoId: '',
    codigo: '',
    sae: '',
    incidencia: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: ''
  };

  // Mensaje de error para validación de fechas
  readonly errorFecha = signal<string>('');

  private dialog = inject(Dialog);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private authService: AuthService,
    private parametrosService: ParametrosService
  ) {}

  ngOnInit(): void {
    this.inicializarAutenticacion();
  }

  /**
   * Inicializa la autenticación y carga los parámetros
   */
  private inicializarAutenticacion(): void {
    // Si ya hay token, cargar parámetros directamente
    if (this.authService.isAuthenticated()) {
      this.cargarParametros();
    } else {
      // Generar token primero (usar credenciales por defecto o pedirlas al usuario)
      this.authService.generarToken('empghus7', 'Prueba1234').subscribe({
        next: () => {
          console.log('Token generado exitosamente');
          this.cargarParametros();
        },
        error: (error) => {
          console.error('Error al generar token:', error);
          // Aquí podrías mostrar un mensaje al usuario o pedir credenciales
        }
      });
    }
  }

  /**
   * Carga los parámetros desde el API
   */
  private cargarParametros(): void {
    this.parametrosService.obtenerParametrosIniciales().subscribe({
      next: (response) => {
        if (response.codigo === 1 && response.entidad) {
          // Llenar los combos con los datos recibidos
          if (response.entidad['TipoIdLlamada']) {
            this.tipoIdLlamada.set(response.entidad['TipoIdLlamada']);
          }
          if (response.entidad['Distritos']) {
            this.distritos.set(response.entidad['Distritos']);
          }
          if (response.entidad['Sucursales']) {
            this.sucursales.set(response.entidad['Sucursales']);
          }
          console.log('Parámetros cargados:', response);
        } else {
          console.error('Error en la respuesta:', response.mensajeUsuario);
        }
      },
      error: (error) => {
        console.error('Error al cargar parámetros:', error);
      }
    });
  }

  /**
   * Verifica si el campo código debe estar deshabilitado
   */
  get codigoDeshabilitado(): boolean {
    return !this.filtro.tipoId || this.filtro.tipoId === '';
  }

  /**
   * Maneja el cambio en el Tipo ID
   */
  onTipoIdChange(): void {
    // Si se deselecciona el Tipo ID, limpiar el campo código
    if (!this.filtro.tipoId || this.filtro.tipoId === '') {
      this.filtro.codigo = '';
    }
    this.cdr.markForCheck();
  }

  /**
   * Valida que la diferencia entre las fechas no sea mayor a 30 días
   */
  validarFechas(): void {
    this.errorFecha.set('');
    
    if (this.filtro.fechaDesde && this.filtro.fechaHasta) {
      const fechaDesde = new Date(this.filtro.fechaDesde);
      const fechaHasta = new Date(this.filtro.fechaHasta);
      
      if (fechaDesde > fechaHasta) {
        this.errorFecha.set('La fecha desde no puede ser mayor que la fecha hasta');
        this.cdr.markForCheck();
        return;
      }
      
      const diferenciaDias = Math.abs(Math.floor((fechaHasta.getTime() - fechaDesde.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (diferenciaDias > 30) {
        this.errorFecha.set('La diferencia entre las fechas no puede ser mayor a 30 días');
        this.filtro.fechaHasta = '';
        this.cdr.markForCheck();
      }
    }
  }

  protected openModal(): void {
    this.dialog.open(ModalFiltroAvnazado, { disableClose: true });
  }
}


