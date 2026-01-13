import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtencionAClientes } from './atencion-a-clientes';

describe('AtencionAClientes', () => {
  let component: AtencionAClientes;
  let fixture: ComponentFixture<AtencionAClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtencionAClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtencionAClientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
