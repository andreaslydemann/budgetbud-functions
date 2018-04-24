// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
// const myFunctions = require('../get_linked_accounts');

jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
// require('cors'); // Jest will return the mock not the real module

describe('getLinkedAccounts', () => {

    test('returns a 401 for GET calls without token', done => {
        const mockRequest = {
            method: 'GET',
            query: {
                userID: "11111111111111111"
            }
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(422);
                return {
                    send: jest.fn(label => {
                        expect(label).toBe('Kunne ikke hente konti.');
                        done();
                    })
                }
            }
        };
        myFunctions.getLinkedAccounts(mockRequest, mockResponse);
    });

    test('returns a 422 for not finding accounts', done => {
        const mockRequest = {
            method: 'GET',
            query: {
                userID: "11111111111111111"
            }
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(422);
                return {
                    send: jest.fn(label => {
                        expect(label).toBe('Kunne ikke hente konti.');
                        done();
                    })
                }
            }
        };
        myFunctions.getLinkedAccounts(mockRequest, mockResponse);
    });

    test('returns a 200 with an array of accounts', done => {
        const mockRequest = {
            method: 'GET',
            query: {
                userID: "1111111111"
            }
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(accountArray => {
                        expect(accountArray).toHaveLength(1);
                        done();
                    })
                }
            }
        };
        myFunctions.getLinkedAccounts(mockRequest, mockResponse);
    });

});
