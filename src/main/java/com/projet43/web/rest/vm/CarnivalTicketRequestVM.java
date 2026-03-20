package com.projet43.web.rest.vm;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ViewModel for encapsulating the data of an AI-suggested ticket
 * sent to the backend for confirmation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarnivalTicketRequestVM {

    private String title;
    private String description;
    private String type;
    private String priority;
    private boolean suggestedByAI;
    private String originalUserInput;
}