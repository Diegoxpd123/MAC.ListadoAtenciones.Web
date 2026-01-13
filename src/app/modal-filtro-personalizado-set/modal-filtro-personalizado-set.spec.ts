import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFiltroPersonalizadoSet } from './modal-filtro-personalizado-set';

describe('ModalFiltroPersonalizadoSet', () => {
  let component: ModalFiltroPersonalizadoSet;
  let fixture: ComponentFixture<ModalFiltroPersonalizadoSet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFiltroPersonalizadoSet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFiltroPersonalizadoSet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

