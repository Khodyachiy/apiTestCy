
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

  it('intercepting and modifying the request and response', () => {
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

  it.only('delete a new article in a global feed', () => {
    const userCredentials = {
      user: {
        email: "nick1985@test.com",
        password: "password",
      },
    };

    const bodyRequest = {
      article: {
        title: "2Update",
        description: "2Up to New art",
        body: "2Up description",
        tagList: [],
      },
    };

    // User's loggin
    cy.request('POST', 'https://conduit-api.bondaracademy.com/api/users/login', userCredentials)
      .its('body')
      .then((body) => {
        const token = body.user.token;

        // Creating an article
        cy.request({
          url: 'https://conduit-api.bondaracademy.com/api/articles/',
          headers: { Authorization: 'Token ' + token },
          method: 'POST',
          body: bodyRequest,
        }).then((response) => {
          expect(response.status).to.equal(201);
        });

        // Go to Global Feed
        cy.contains('Global Feed').click();

        // Waiting the update of articles
        cy.intercept('GET', '**/api/articles?limit=10&offset=0').as('getArticles');
        cy.wait('@getArticles').then((interception) => {
          expect(interception.response.statusCode).to.equal(200);
          expect(interception.response.body.articles).to.have.length.greaterThan(0);
        });

        // Checking the article of the list
        cy.contains(bodyRequest.article.title).should('be.visible');

        // Click on the article
        cy.get('.article-preview').first().click();

        // Checking the artical on the page
        cy.url().should('include', '/article/');
        cy.contains(bodyRequest.article.title).should('be.visible');

        // Delete the article
        cy.get('.article-actions', { timeout: 10000 })
          .should('be.visible')
          .contains('Delete Article')
          .click();

        // Checking the article is removing
        cy.contains('Global Feed').click();
        cy.contains(bodyRequest.article.title).should('not.exist');
      });

  });
    

})