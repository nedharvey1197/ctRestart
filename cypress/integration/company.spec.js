describe('Company Analysis Workflow', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/companies/*').as('getCompany');
    cy.intercept('POST', '/api/companies/*/trials').as('analyzeTrials');
  });

  it('completes full analysis workflow', () => {
    // Visit company page
    cy.visit('/companies/TEST001');
    cy.wait('@getCompany');

    // Trigger analysis
    cy.contains('Analyze Trials').click();
    cy.wait('@analyzeTrials');

    // Verify results
    cy.contains('Clinical Trial Analytics').should('be.visible');
    cy.contains('Phase Distribution').should('be.visible');
    cy.get('[data-testid="trial-list"]').should('exist');
  });

  it('handles errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '/api/companies/*/trials', {
      statusCode: 500,
      body: { error: 'Server Error' }
    }).as('failedAnalysis');

    cy.visit('/companies/TEST001');
    cy.contains('Analyze Trials').click();
    cy.wait('@failedAnalysis');

    // Verify error handling
    cy.contains('Error').should('be.visible');
    cy.contains('Retry').click();
  });

  it('persists data between sessions', () => {
    // Complete analysis
    cy.visit('/companies/TEST001');
    cy.contains('Analyze Trials').click();
    cy.wait('@analyzeTrials');

    // Reload page
    cy.reload();

    // Verify data persists
    cy.contains('Clinical Trial Analytics').should('be.visible');
    cy.get('[data-testid="trial-list"]').should('exist');
  });

  it('handles large datasets efficiently', () => {
    // Mock large dataset
    cy.intercept('GET', '/api/companies/*', {
      fixture: 'largeCompanyData.json'
    }).as('getLargeCompany');

    cy.visit('/companies/TEST001');
    cy.wait('@getLargeCompany');

    // Test initial render time
    cy.window().then((win) => {
      const start = performance.now();
      cy.get('[data-testid="trial-list"]').should('exist').then(() => {
        const end = performance.now();
        expect(end - start).to.be.lessThan(1000); // Should render in under 1s
      });
    });

    // Test pagination
    cy.get('[data-testid="pagination"]').within(() => {
      // Test page navigation
      cy.get('[aria-label="next page"]').click();
      cy.get('[aria-label="previous page"]').click();
      
      // Test rows per page
      cy.get('select').select('50');
      cy.get('[data-testid="trial-row"]').should('have.length', 50);
    });

    // Test scroll performance
    cy.get('[data-testid="trial-list"]').scrollTo('bottom', { duration: 1000 });
    cy.window().its('requestAnimationFrame').should('be.called');
  });

  it('meets accessibility standards', () => {
    cy.visit('/companies/TEST001');
    cy.injectAxe();
    
    // Test page-level accessibility
    cy.checkA11y();

    // Test specific components
    cy.get('[data-testid="trial-list"]').within(() => {
      cy.checkA11y();
    });

    // Test keyboard navigation
    cy.focused().tab().should('have.attr', 'aria-label');
    cy.get('[data-testid="trial-row"]').first().focus()
      .type('{enter}')
      .should('have.class', 'selected');
  });
}); 