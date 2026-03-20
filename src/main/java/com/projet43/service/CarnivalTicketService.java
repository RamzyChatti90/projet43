package com.projet43.service;

import com.projet43.web.rest.vm.CarnivalTicketRequestVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service métier pour gérer la logique de confirmation et de dispatch des tickets.
 * Il simule l'intégration avec un système de ticketing externe (Jira/Trello) via une méthode `dispatchTicket`.
 */
@Service
public class CarnivalTicketService {

    private final Logger log = LoggerFactory.getLogger(CarnivalTicketService.class);

    /**
     * Confirme et dispatche un ticket vers un système de ticketing externe après validation.
     * Cette méthode simule l'intégration avec un système comme Jira ou Trello.
     *
     * @param ticketRequest Le ViewModel contenant les détails du ticket suggéré par l'IA et confirmé par l'utilisateur.
     * @return Une chaîne de caractères confirmant la création du ticket et son identifiant simulé.
     */
    public String confirmAndDispatchTicket(CarnivalTicketRequestVM ticketRequest) {
        log.info("Requête de confirmation et dispatch de ticket reçue: {}", ticketRequest);

        // --- Logique de validation métier (exemple) ---
        if (ticketRequest.getTitle() == null || ticketRequest.getTitle().trim().isEmpty()) {
            log.warn("Tentative de dispatch de ticket sans titre. Requête rejetée.");
            throw new IllegalArgumentException("Le titre du ticket ne peut pas être vide.");
        }
        if (ticketRequest.getDescription() == null || ticketRequest.getDescription().trim().isEmpty()) {
            log.warn("Tentative de dispatch de ticket sans description. Requête rejetée.");
            throw new IllegalArgumentException("La description du ticket ne peut pas être vide.");
        }

        // --- Simulation de l'intégration avec un système de ticketing externe ---
        String ticketId = dispatchTicketToExternalSystem(ticketRequest);

        log.info("Ticket dispatche avec succès. ID du ticket externe simulé: {}", ticketId);
        return "Ticket '" + ticketRequest.getTitle() + "' créé avec succès. Référence externe: " + ticketId;
    }

    /**
     * Simule l'envoi d'un ticket à un système de gestion de tickets externe (ex: Jira, Trello).
     * Dans une implémentation réelle, cette méthode appellerait une API REST externe.
     *
     * @param ticketRequest Les détails du ticket à dispatcher.
     * @return L'identifiant du ticket généré par le système externe simulé.
     */
    private String dispatchTicketToExternalSystem(CarnivalTicketRequestVM ticketRequest) {
        // --- Simulation de l'appel à une API externe ---
        log.debug(
            "Simulation de l'envoi du ticket vers le système externe:" +
            "\n  Titre: {}" +
            "\n  Description: {}" +
            "\n  Type: {}" +
            "\n  Priorité: {}" +
            "\n  Suggéré par IA: {}" +
            "\n  Input utilisateur original: {}",
            ticketRequest.getTitle(),
            ticketRequest.getDescription(),
            ticketRequest.getType(),
            ticketRequest.getPriority(),
            ticketRequest.isSuggestedByAI(),
            ticketRequest.getOriginalUserInput()
        );

        // Générer un identifiant de ticket simulé (ex: JIRA-XXXX, TRL-XXXX)
        String simulatedPrefix = "CRVL"; // Carnival
        String simulatedTicketId = simulatedPrefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        try {
            // Simuler un délai réseau/traitement externe
            Thread.sleep(500); // 0.5 seconde
        } catch (InterruptedException e) {
            log.error("L'interruption du thread de simulation a échoué: {}", e.getMessage());
            Thread.currentThread().interrupt();
        }

        log.info("Ticket simulé {} créé dans le système externe avec succès.", simulatedTicketId);
        return simulatedTicketId;
    }
}