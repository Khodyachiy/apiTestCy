
describe('Test with backend', () => {

  beforeEach('login to application', () => {
    cy.loginToApplication()
  })

 
  it('verify correct request and response', () => {
    // Intercepting the request to create an article
    cy.intercept('POST', /\/api\/articles\//).as('postArticles');

    // Click to "Next Article" button
    cy.contains('New Article').click();

    // Filling in the fields of form
    cy.get('[formcontrolname="title"]').type('This is the title');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');

    // Click to "Publish Article" button
    cy.contains('Publish Article').click();

    // Waiting the end of request
    cy.wait('@postArticles').then((xhr) => {
      // Logs the request and response
      cy.log('Request:', xhr.request);
      cy.log('Response:', xhr.response);

      // Checks the status of response
      expect(xhr.response.statusCode).to.equal(201);

      // Checks body of request
      expect(xhr.request.body.article).to.have.property('body', 'This is a body of the article');

      // Checks body of response
      expect(xhr.response.body.article).to.have.property('description', 'This is a description');
    })
  })

  it.only('intercepting and modifying the request and response', () => {
    cy.intercept('POST', '**/articles', (req) => {
      expect(req.body.article.description).to.equal('This is a description');
      req.reply((res) => {
        console.log('Response body:', res.body); // logging
        if (res.body && res.body.article) {
          res.body.article.description = "This is a description 2";
        } else {
          throw new Error('Response body or article is undefined');
        }
      });
    }).as('postArticles');  

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is the title');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the Article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then((xhr) => {
      expect(xhr.response.statusCode).to.equal(201); // or 200, depended by API
      expect(xhr.request.body.article.body).to.equal('This is a body of the Article');
      expect(xhr.response.body.article.description).to.equal('This is a description 2');
    });
  });

})