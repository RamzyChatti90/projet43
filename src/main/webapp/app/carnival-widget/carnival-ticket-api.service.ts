import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

/**
 * Interface représentant la structure des données pour une requête de ticket CARNIVAL.
 * Cela correspond au ViewModel Java du backend CarnivalTicketRequestVM.java.
 */
export interface ICarnivalTicketRequestVM {
  title: string;
  description: string;
  type: string;
  priority: string;
  suggestedByAI: boolean;
  originalUserInput: string;
}

/**
 * Service Angular pour interagir avec l'API CARNIVAL de gestion des tickets.
 * Il permet notamment de confirmer les tickets suggérés par l'IA au backend.
 */
@Injectable({
  providedIn: 'root',
})
export class CarnivalTicketApiService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/carnival/tickets');

  constructor(protected httpClient: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  /**
   * Envoie une requête de ticket au backend pour confirmation et dispatch.
   *
   * @param ticket Les données du ticket suggéré par l'IA à confirmer.
   * @returns Un Observable qui émet la réponse du backend (par exemple, les données du ticket confirmé).
   */
  confirmTicket(ticket: ICarnivalTicketRequestVM): Observable<ICarnivalTicketRequestVM> {
    return this.httpClient.post<ICarnivalTicketRequestVM>(this.resourceUrl, ticket);
  }
}