/* globals describe, it, expect */

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('custom auth', () => {
  it('passes authentication', async () => {
    const bundle = {
      authData: {
        ftpHost: 'localhost',        
        ftpUsername: 'bob',
        ftpPassword: 'Test123#'
      }
    };

    const response = await appTester(App.authentication.test, bundle);
    expect(response).toHaveProperty('id');
  });

  it('fails on bad auth', async () => {
    const bundle = {
      authData: {
        ftpHost: 'localhost',        
        ftpUsername: 'bob',
        ftpPassword: 'Test123#Wrong'
      }
    };

    try {
      await appTester(App.authentication.test, bundle);
    } catch (error) {
      expect(error.message);
      return;
    }
    throw new Error('appTester should have thrown');
  });

});
