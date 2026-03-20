describe('Login/Logout functionality', () => {
  beforeEach(() => {
    // Clear cookies and local storage to ensure a clean session for each test
    cy.clearCookies();
    cy.clearLocalStorage();
    // Visit the base URL of the application
    cy.visit('/');
  });

  it('should allow a user to log in and then log out successfully', () => {
    // 1. Navigate to the login page
    // JHipster applications typically have a login button in the navbar when unauthenticated
    cy.get('[data-cy="navbar-item-login"]').click();
    cy.url().should('include', '/login'); // Verify current URL is the login page

    // 2. Enter valid credentials (default JHipster 'user' account)
    cy.get('[data-cy="username"]').type('user');
    cy.get('[data-cy="password"]').type('user');

    // 3. Submit the login form
    cy.get('[data-cy="login-submit"]').click();

    // 4. Verify successful login and redirection to the home page
    cy.url().should('include', '/'); // Should be redirected to the root/home page
    // Check for an element indicating the user is on the home page and authenticated
    cy.get('[data-cy="home-page"]').should('be.visible');
    cy.get('[data-cy="navbar-item-logout"]').should('be.visible'); // Logout button should now be visible
    cy.get('[data-cy="navbar-item-login"]').should('not.exist'); // Login button should not be visible after login

    // 5. Perform logout
    cy.get('[data-cy="navbar-item-logout"]').click();

    // 6. Verify successful logout and redirection to the home page (unauthenticated state)
    cy.url().should('include', '/'); // Should be redirected back to the root/home page
    cy.get('[data-cy="navbar-item-login"]').should('be.visible'); // Login button should be visible again
    cy.get('[data-cy="navbar-item-logout"]').should('not.exist'); // Logout button should not exist
    cy.get('[data-cy="home-page"]').should('be.visible'); // Home page content might change but the element should still be there
  });

  it('should display an error message for invalid login credentials', () => {
    // Navigate to the login page
    cy.get('[data-cy="navbar-item-login"]').click();
    cy.url().should('include', '/login');

    // Enter invalid credentials
    cy.get('[data-cy="username"]').type('wronguser');
    cy.get('[data-cy="password"]').type('wrongpass');

    // Submit the login form
    cy.get('[data-cy="login-submit"]').click();

    // Verify error message is displayed and user remains on the login page
    cy.get('[data-cy="login-error"]').should('be.visible').and('contain.text', 'Failed to sign in!');
    cy.url().should('include', '/login'); // Should still be on the login page
    cy.get('[data-cy="navbar-item-login"]').should('be.visible'); // Login button still visible
  });

  it('should redirect to login page when attempting to access a protected resource without authentication', () => {
    // Attempt to visit a protected route, e.g., the admin page in JHipster
    cy.visit('/admin');

    // Verify redirection to the login page
    cy.url().should('include', '/login');
    cy.get('[data-cy="username"]').should('be.visible'); // Ensure login form is present
    cy.get('[data-cy="password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });
});