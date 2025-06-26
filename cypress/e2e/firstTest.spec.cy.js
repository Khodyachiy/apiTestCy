describe('Test with backend', () => {

  beforeEach('login to application', () => {
    cy.intercept({method: 'GET', path:'tags'}, {fixture: 'tags.json'})
    cy.loginToApplication()
  })

  it('first', () => {
    cy.log('Yaaaay we logged in')
  })

 
  it('verify correct request and response', () => {

    cy.intercept('POST', 'https://conduit-api.bondaracademy.com/api/articles/new-26692').as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('This is the title')
    cy.get('[formcontrolname="description"]').type('This is a description')
    cy.get('[formcontrolname="body"]').type('This is a body of the article')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles').its('response.statusCode').should('eq', 200);

    cy.wait('@postArticles').then( xhr => {
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.request.body.article.body).to.equal('This is a body of the article')
      expect(xhr.response.body.article.description).to.equal('This is a description')
    })

  })

  it('intercepting and modifying the request and response', {browser: 'chrome'}, () => {

    //cy.intercept('POST', '**/articles', (req) => {
    //  req.body.article.description = "This is a description 2"
    //}).as('postArticles')

    cy.intercept('POST', '**/articles', (req) => {
      req.reply( res => {
        expect(res.body.article.description).to.equal('This is a description')
        res.body.article.description = "This is a description 2"
      })
    }).as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('This is the title')
    cy.get('[formcontrolname="description"]').type('This is a description')
    cy.get('[formcontrolname="body"]').type('This is a body of the Article')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles').then( xhr => {
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal('This is a body of the Article')
      expect(xhr.response.body.article.description).to.equal('This is a description 2')
    })

  })

  it('verify popular tags are displayed', () => {
    cy.get('.tag-list')
    .should('contain', 'cypress')
    .and('contain', 'automation')
    .and('contain', 'testing')

  })

  it('verify global feed likes count', () => {
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/articles/feed*', { "articles":[],"articlesCount":0 })
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/articles*', { fixture: 'articles.json' })

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then(heartList => {
      expect(heartList[0]).to.contain('660')
      expect(heartList[1]).to.contain('235')
    })

    cy.fixture('articles').then(file => {
      const articleLink = file.articles[1].slug
      file.articles[1].favoritesCount = 236
      cy.intercept('POST', 'https://conduit-api.bondaracademy.com/api/articles/'+articleLink+'/favorite')
    })

    cy.get('app-article-list button').eq(1).click().should('contain', '236')

  })

  it('delete a new article in a global feed', () => {

    const bodyRequest = {
      "article": {
        "title": "2Update",
        "description": "2Up to New art",
        "body": "2Up description",
        "tagList": []
      }
    }

    cy.get('@token').then(token => {

      cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles/',
        headers: { 'Authorization': 'Token '+token},
        method: 'POST',
        body: bodyRequest
      }).then( response =>{
        expect(response.status).to.equal(201)
      })

      cy.contains('Global Feed').click()
      // These commands from the lesson aren't working on my side without articles updates
      //cy.get('article-preview').first().click()
      //cy.get('article-actions').contains('Delete Article').click()
 
      cy.intercept('GET', '**/api/articles?limit=10&offset=0').as('getArticles');
      cy.wait('@getArticles').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.articles).to.have.length.greaterThan(0);
      })
      cy.contains(bodyRequest.article.title).should('be.visible');

      cy.get('.article-preview').first().click();
      cy.get('.article-actions')
        .should('be.visible')
        .contains('Delete Article')
        .click();

      cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles/Update-26692',
        headers: { 'Authorization': 'Token '+token},
        method: 'GET'
      }).its('body').then( body => {
        expect(body.article).to.exist
        expect(body.article.title).not.to.equal('2Update')
      })

    })
  })

})