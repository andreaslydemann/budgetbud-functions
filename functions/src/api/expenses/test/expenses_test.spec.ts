export {};
// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
const tokenHelper = require('../../../helpers/id_token_helper');
const accountsHelper = require('../../../helpers/accounts_helper');

jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module

jest.mock('axios');
require('axios');

describe('getAverageExpenses', () => {
    let admin;
    beforeEach(async () => {
        mockFirebase();
    });

    test('returns a 200 code and the expected return value', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockAccountsHelper = accountsHelper.getLinkedAccounts = jest.fn();
        mockAccountsHelper.mockReturnValueOnce('');

        const returnVal = {categoryTypeID: 1, amount: 25};

        axios.get.mockResolvedValueOnce(returnVal);


        const mockRequest = {
            method: 'GET',
            query: {userID: '4564564564'}
        };

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(actualReturn => {
                        expect(actualReturn).toBe(returnVal);
                        done();
                    })
                }
            }
        };
        myFunctions.getAverageExpenses(mockRequest, mockResponse);
    });
});