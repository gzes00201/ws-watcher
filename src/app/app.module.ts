import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { StateComponent } from './components/state/state.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import {MatIconModule} from '@angular/material/icon';
import { ReportListComponent } from './components/report-list/report-list.component';
import {MatTableModule} from '@angular/material/table';
import { TestsComponent } from './components/tests/tests.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import { PlayresultComponent } from './components/tests/playresult/playresult.component';
import { PlayResultHistoryComponent } from './components/tests/play-result-history/play-result-history.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    StateComponent,
    MessageBoxComponent,
    ControlPanelComponent,
    ReportListComponent,
    TestsComponent,
    PlayresultComponent,
    PlayResultHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatDividerModule,
    MatListModule,
    NgxJsonViewerModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatExpansionModule,
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
