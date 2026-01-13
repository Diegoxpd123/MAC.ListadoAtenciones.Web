import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFiltroAvnazado } from './modal-filtro-avnazado';

describe('ModalFiltroAvnazado', () => {
  let component: ModalFiltroAvnazado;
  let fixture: ComponentFixture<ModalFiltroAvnazado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFiltroAvnazado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFiltroAvnazado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
