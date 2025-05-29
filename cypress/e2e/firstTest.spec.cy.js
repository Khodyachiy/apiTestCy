describe('Test with backend', () => {

  beforeEach('login to application', () => {
    cy.loginToApplication()
  })

  it('first', () => {
    cy.log('Yaaaay we logged in')
  })

 
  it.only('verify correct request and response', () => {

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

  })/*

  it.only('verify correct request and response', () => {
    // Перехватываем запрос на создание статьи
    cy.intercept('POST', /\/api\/articles\//).as('postArticles');

    // Нажимаем на кнопку "New Article"
    cy.contains('New Article').click();

    // Заполняем поля формы
    cy.get('[formcontrolname="title"]').type('This is the title');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');

    // Нажимаем на кнопку "Publish Article"
    cy.contains('Publish Article').click();

    // Ожидаем завершения запроса
    cy.wait('@postArticles').then((xhr) => {
      // Логируем запрос и ответ
      cy.log('Request:', xhr.request);
      cy.log('Response:', xhr.response);

      // Проверяем статус ответа
      expect(xhr.response.statusCode).to.equal(201);

      // Проверяем тело запроса
      expect(xhr.request.body.article).to.have.property('body', 'This is a body of the article');

      // Проверяем тело ответа
      expect(xhr.response.body.article).to.have.property('description', 'This is a description');
    });
  });*/

})