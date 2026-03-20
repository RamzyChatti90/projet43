package com.projet43.web.rest;

import com.projet43.service.CarnivalTicketService;
import com.projet43.web.rest.vm.CarnivalTicketRequestVM;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;

import jakarta.validation.Valid;

/**
 * REST controller for managing CARNIVAL widget interactions, specifically ticket confirmation.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Carnival Widget", description = "Endpoints for CARNIVAL AI Chat & Ticketing Widget integration")
public class CarnivalWidgetResource {

    private final Logger log = LoggerFactory.getLogger(CarnivalWidgetResource.class);

    private static final String ENTITY_NAME = "carnivalTicket";

    private final CarnivalTicketService carnivalTicketService;

    public CarnivalWidgetResource(CarnivalTicketService carnivalTicketService) {
        this.carnivalTicketService = carnivalTicketService;
    }

    /**
     * {@code POST  /carnival-widget/tickets/confirm} : Confirms a suggested ticket by the AI and dispatches it.
     * This endpoint is used by the Angular widget to send the user-confirmed ticket details to the backend.
     *
     * @param ticketRequest the {@link CarnivalTicketRequestVM} containing ticket details for confirmation.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} if the ticket was successfully confirmed and dispatched,
     *         or with status {@code 400 (Bad Request)} if the request is invalid.
     */
    @PostMapping("/carnival-widget/tickets/confirm")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> confirmTicket(@Valid @RequestBody CarnivalTicketRequestVM ticketRequest) {
        log.debug("REST request to confirm and dispatch Carnival ticket: {}", ticketRequest);

        try {
            carnivalTicketService.confirmAndDispatchTicket(ticketRequest);
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .headers(HeaderUtil.createEntityCreationAlert("projet43", true, ENTITY_NAME, ticketRequest.getTitle()))
                .body("Ticket '" + ticketRequest.getTitle() + "' successfully confirmed and dispatched.");
        } catch (Exception e) {
            log.error("Error confirming and dispatching Carnival ticket: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .headers(HeaderUtil.createFailureAlert("projet43", true, ENTITY_NAME, "ticketConfirmationError", "Failed to confirm and dispatch ticket: " + e.getMessage()))
                .body("Failed to confirm and dispatch ticket: " + e.getMessage());
        }
    }
}