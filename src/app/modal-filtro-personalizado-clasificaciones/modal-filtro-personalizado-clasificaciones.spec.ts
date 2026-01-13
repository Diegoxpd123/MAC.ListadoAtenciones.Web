import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFiltroPersonalizadoClasificaciones } from './modal-filtro-personalizado-clasificaciones';

describe('ModalFiltroPersonalizadoClasificaciones', () => {
  let component: ModalFiltroPersonalizadoClasificaciones;
  let fixture: ComponentFixture<ModalFiltroPersonalizadoClasificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFiltroPersonalizadoClasificaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFiltroPersonalizadoClasificaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

