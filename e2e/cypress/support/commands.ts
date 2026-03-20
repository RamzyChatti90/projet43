declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to log in a user.
     * @example cy.login('admin', 'admin')
     */
    login(username: string, password: string): Chainable<any>;
    /**
     * Custom command to log out the currently logged-in user.
     * @example cy.logout()
     */
    logout(): Chainable<any>;
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('[name="username"]').type(username);
  cy.get('[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('logout', () => {
  cy.get('#account-menu').click(); // Click on the account menu dropdown
  cy.get('#logout').click();      // Click on the logout link within the menu
});