import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface ListaGenericaDto {
  codigo: string;
  descripcion: string;
  valorAlf: string | null;
}

export interface RespuestaParametros {
  codigo: number;
  descripcion: string;
  mensajeUsuario: string | null;
  entidad: {
    [key: string]: ListaGenericaDto[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ParametrosService {
  // Usar proxy en desarrollo para evitar CORS
  private readonly baseUrl = '/Home';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Lista los parámetros para llenar los combos
   * Genera un nuevo token antes de cada llamada al API
   */
  listarParametro(filtro: { [key: string]: number }): Observable<RespuestaParametros> {
    // Generar un nuevo token antes de cada llamada
    return this.authService.generarToken('empghus7', 'Prueba1234').pipe(
      switchMap(response => {
        if (!response || !response.Token) {
          return throwError(() => new Error('No se pudo generar el token'));
        }

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'authLDS': response.Token
        });

        console.log('Token generado para ListarParametro:', response.Token.substring(0, 20) + '...');
        console.log('Filtro enviado:', filtro);

        return this.http.post<RespuestaParametros>(
          `${this.baseUrl}/ListarParametro`,
          filtro,
          { headers }
        );
      }),
      catchError(error => {
        console.error('Error en listarParametro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Método helper para obtener parámetros comunes
   */
  obtenerParametrosIniciales(): Observable<RespuestaParametros> {
    const filtro = {
      TipoIdLlamada: 0,
      Distritos: 0,
      Sucursales: 0
    };
    return this.listarParametro(filtro);
  }

  /**
   * Obtiene todos los parámetros necesarios para el filtro avanzado
   * Incluye todos los desplegables de la sección "Datos de llamada"
   */
  obtenerParametrosFiltroAvanzado(): Observable<RespuestaParametros> {
    const filtro = {
      // Datos de llamada
      TipoIdLlamada: 0,        // Tipo ID
      Descripciones: 0,        // Descripción
      Distritos: 0,            // Distrito (múltiple)
      ZonaLlamada: 0,          // Zona
      TipoOrigenLLamada: 0,    // Tipo de Origen Llamada
      Sucursales: 0,          // Sucursal
      CentroDeServicio: 0,     // Centro de Servicio
      FechaLlamada: 0,        // Condiciones de fecha (Ninguno, Desde, Entre, Igual, Hasta)
      // Datos del predio
      Clasificaciones: 0,      // Clasificación
      Tipos: 0,               // Tipo (requiere valor, usando 0 por defecto)
      SubTipos: 0,            // Sub tipo pedido (requiere valor, usando 0 por defecto)
      Estados: 0,             // Estado
      // Datos de eléctricos
      Sets: 0,                // SET
      Alimentaciones: 0       // Alimentador
    };
    return this.listarParametro(filtro);
  }
}

