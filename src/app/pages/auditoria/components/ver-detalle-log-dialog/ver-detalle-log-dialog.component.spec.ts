import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDetalleLogDialogComponent } from './ver-detalle-log-dialog.component';

describe('VerDetalleLogDialogComponent', () => {
  let component: VerDetalleLogDialogComponent;
  let fixture: ComponentFixture<VerDetalleLogDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerDetalleLogDialogComponent]
    });
    fixture = TestBed.createComponent(VerDetalleLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
