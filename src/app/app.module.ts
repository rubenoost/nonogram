import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReversePipe } from './pipes/revers.pipe';
import { NonogramDisplayComponent } from './components/nonogram-display/nonogram-display.component';

@NgModule({
  declarations: [
    AppComponent,
    ReversePipe,
    NonogramDisplayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
