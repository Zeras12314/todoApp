import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoFilterMobileComponent } from './todo-filter-mobile.component';

describe('TodoFilterMobileComponent', () => {
  let component: TodoFilterMobileComponent;
  let fixture: ComponentFixture<TodoFilterMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFilterMobileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodoFilterMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
