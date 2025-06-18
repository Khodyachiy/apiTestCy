/// <reference types="cypress"/>

describe('Test log out', () => {

    beforeEach('login to the app', () => {
        cy.loginToApplication()
    })

    it('verify use on log out successfuly', () => {
        cy.contains('Setting').click()
        cy.contains('Or click here to logout').click()
        cy.get('.navbar-nav').should('contain', 'Sing up')
    })
})
