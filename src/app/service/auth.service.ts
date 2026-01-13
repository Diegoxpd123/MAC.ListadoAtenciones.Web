import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Usar proxy en desarrollo para evitar CORS
  private readonly tokenUrl = '/Interno/PlatafWeb/OAuth/OAuth.svc/Token/GenerarToken';
  private readonly tokenKey = 'authLDS_token';
  
  // Signal para almacenar el token
  readonly token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    // Cargar token del localStorage al iniciar (solo en el navegador)
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedToken = localStorage.getItem(this.tokenKey);
      if (savedToken) {
        this.token.set(savedToken);
      }
    }
  }

  /**
   * Genera un token de autenticación
   */
  generarToken(usuario: string, password: string): Observable<{ Token: string }> {
    const body = {
      datosToken: {
        Usuario: usuario,
        Password: password,
        KeyDominio: 'LDS',
        Empresa: '7',
        EmpresaTrabaja: '7',
        TipoDispositivo: 'WEB'
      }
    };

    return this.http.post<{ Token: string }>(this.tokenUrl, body).pipe(
      tap(response => {
        if (response.Token) {
          this.token.set(response.Token);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(this.tokenKey, response.Token);
          }
        }
      })
    );
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  /**
   * Elimina el token
   */
  logout(): void {
    this.token.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
    }
  }
}

