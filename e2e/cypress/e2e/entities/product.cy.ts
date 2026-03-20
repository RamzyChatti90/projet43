import {
  entityTableSelector,
  entityCreateButtonSelector,
  entitySaveButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
  entityViewButtonSelector,
  entityEditButtonSelector,
} from '../../support/entity'; // Assuming this file defines common selectors for JHipster entities

describe('Product e2e test', () => {
  const productPageUrl = '/product';
  const productNewPageUrl = '/product/new';
  const productEditPageUrl = '/product/:id/edit';

  // Credentials for admin user
  const adminUsername = Cypress.env('adminUsername') || 'admin';
  const adminPassword = Cypress.env('adminPassword') || 'admin';

  before(() => {
    // Ensure admin is logged in before any tests run
    cy.login(adminUsername, adminPassword);
    cy.wait(500); // Give some time for redirects and page load
  });

  beforeEach(() => {
    // Navigate to the product entity page before each test
    cy.visit('/'); // Start from the home page
    cy.clickOnEntity('product'); // Custom command to navigate to the 'Product' entity page
  });

  after(() => {
    // Logout after all tests in this spec file are done
    cy.logout();
  });

  it('should load Product list page', () => {
    cy.url().should('include', productPageUrl);
    cy.get(entityTableSelector).should('exist');
    cy.get(entityCreateButtonSelector).should('exist');
  });

  it('should create, view, edit and delete a Product entity', () => {
    const productName = `Awesome Widget ${Date.now()}`;
    const productDescription = `A detailed description for ${productName}`;
    const productPrice = (Math.random() * 100 + 1).toFixed(2); // Price between 1.00 and 101.00
    const productQuantity = Math.floor(Math.random() * 1000) + 1; // Quantity between 1 and 1000

    // 1. Create a new Product
    cy.get(entityCreateButtonSelector).click();
    cy.url().should('include', productNewPageUrl);

    cy.get('#field_name').type(productName);
    cy.get('#field_description').type(productDescription);
    cy.get('#field_price').clear().type(productPrice); // Use clear for number inputs
    cy.get('#field_quantity').clear().type(productQuantity.toString());

    cy.get(entitySaveButtonSelector).click();

    cy.get(entityTableSelector).should('exist');
    cy.contains(entityTableSelector, productName).should('exist'); // Verify new product is in the list

    // Find the row of the newly created product
    cy.get(entityTableSelector)
      .contains('tr', productName)
      .as('productRow');

    // 2. View the created Product
    cy.get('@productRow').find(entityViewButtonSelector).click();
    cy.url().should('match', /\/product\/\d+\/view$/); // Check URL for view page
    cy.get('[data-cy="name"]').should('contain.text', productName);
    cy.get('[data-cy="description"]').should('contain.text', productDescription);
    cy.get('[data-cy="price"]').should('contain.text', productPrice);
    cy.get('[data-cy="quantity"]').should('contain.text', productQuantity.toString());
    cy.go('back'); // Navigate back to the list page

    // 3. Edit the created Product
    cy.get('@productRow').find(entityEditButtonSelector).click();
    cy.url().should('match', /\/product\/\d+\/edit$/); // Check URL for edit page

    const updatedProductName = `${productName} (Edited)`;
    const updatedProductPrice = (parseFloat(productPrice) + 50).toFixed(2); // Increase price

    cy.get('#field_name').clear().type(updatedProductName);
    cy.get('#field_price').clear().type(updatedProductPrice);

    cy.get(entitySaveButtonSelector).click();

    cy.get(entityTableSelector).should('exist');
    cy.contains(entityTableSelector, updatedProductName).should('exist'); // Verify updated product is in the list
    cy.contains(entityTableSelector, updatedProductPrice).should('exist'); // Verify updated price is in the list

    // Find the row of the updated product for deletion
    cy.get(entityTableSelector)
      .contains('tr', updatedProductName)
      .as('updatedProductRow');

    // 4. Delete the updated Product
    cy.get('@updatedProductRow').find(entityDeleteButtonSelector).click();
    cy.get(entityConfirmDeleteButtonSelector).click(); // Confirm deletion in the modal

    cy.get(entityTableSelector).should('exist');
    cy.contains(entityTableSelector, updatedProductName).should('not.exist'); // Verify product is no longer in the list
  });
});