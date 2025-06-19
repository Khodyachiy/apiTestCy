const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportHeight: 1000,
  viewportHeight: 1920,
  video: false,
  env: {
    username: 'nick1985@test.com',
    password: 'password'
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    baseUrl: 'https://conduit.bondaracademy.com/',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'

  },
});

/*
{
    "baseUrl": "https://conduit.bondaracademy.com/",
    "ignoreTestFiles": "/examples/*",
    "viewportHeight": 1080,
    "viewportWidth": 1920,
    "video": false,
    "reporter": "cypress-multi-reporters",
        "reporterOptions": {
            "configFile": "reporter-config.json"
        },
    "env": {
        "RETRIES": 2,
        "username": "Niko85@test.com",
        "password": "CyTest",
        "apiUrl": "https://conduit.bondaracademy.com/"
    }
}
*/
