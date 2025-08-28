import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ChatRequest, ChatResponse, WoprGameState, WoprStatus } from '../models/wopr.models';

@Injectable({
  providedIn: 'root'
})
export class WoprApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly healthUrl = environment.healthUrl;
  
  private gameStateSubject = new BehaviorSubject<WoprGameState | null>(null);
  public gameState$ = this.gameStateSubject.asObservable();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat/message`, request, this.httpOptions)
      .pipe(
        tap(() => this.updateGameState()),
        catchError(this.handleError)
      );
  }

  getGameState(): Observable<WoprGameState> {
    return this.http.get<WoprGameState>(`${this.baseUrl}/chat/gamestate`, this.httpOptions)
      .pipe(
        tap(gameState => this.gameStateSubject.next(gameState)),
        catchError(this.handleError)
      );
  }

  resetGameState(): Observable<any> {
    return this.http.post(`${this.baseUrl}/chat/reset`, {}, this.httpOptions)
      .pipe(
        tap(() => this.updateGameState()),
        catchError(this.handleError)
      );
  }

  getStatus(): Observable<WoprStatus> {
    return this.http.get<WoprStatus>(`${this.baseUrl}/chat/status`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.healthUrl}/health`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private updateGameState(): void {
    this.getGameState().subscribe();
  }

  private handleError = (error: any): Observable<never> => {
    if (environment.enableLogging) {
      console.error('WOPR API Error:', error);
    }
    
    let errorMessage = 'SYSTEM ERROR: Communication with WOPR failed';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
