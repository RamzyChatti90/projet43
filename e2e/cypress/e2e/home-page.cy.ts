describe('Home page', () => {
  const username = Cypress.env('CYPRESS_USER') ?? 'user';
  const password = Cypress.env('CYPRESS_PASSWORD') ?? 'user';

  beforeEach(() => {
    // Assumes `cy.login()` is a custom command defined in `cypress/support/commands.ts`
    // It should handle navigating to the login page, filling credentials, submitting,
    // and ensuring a successful redirection to the home page.
    cy.login(username, password);
  });

  it('should display the home page content and logged-in user elements after successful login', () => {
    // 1. Verify that the URL is the base URL (home page)
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // 2. Verify the presence of the main welcome message on the home page
    // JHipster's default home page typically has "Welcome, JHipster developer!"
    cy.get('h1').contains('Welcome, JHipster developer!').should('be.visible');

    // 3. Verify the presence of elements specific to a logged-in user in the navigation bar
    // JHipster typically displays the account dropdown for logged-in users.
    cy.get('#account-menu').should('be.visible'); // The main account dropdown menu
    cy.get('#account-menu').click(); // Click to open the dropdown

    // Check for specific items within the opened dropdown
    cy.get('[data-cy="settings"]').should('be.visible');
    cy.get('[data-cy="password"]').should('be.visible');
    cy.get('[data-cy="logout"]').should('be.visible');

    // Optionally verify the username is displayed in the account menu
    cy.get('#account-menu span').contains(username).should('be.visible');

    cy.get('#account-menu').click(); // Close the dropdown (optional)

    // 4. Verify the absence of elements specific to a non-logged-in user
    // The "Sign in" and "Register" links should not be present after login.
    cy.get('[data-cy="login"]').should('not.exist');
    cy.get('[data-cy="register"]').should('not.exist');
  });
});