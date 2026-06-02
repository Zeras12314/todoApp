import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoFilterDesktopComponent } from './todo-filter-desktop.component';

describe('TodoFilterDesktopComponent', () => {
  let component: TodoFilterDesktopComponent;
  let fixture: ComponentFixture<TodoFilterDesktopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFilterDesktopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodoFilterDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
