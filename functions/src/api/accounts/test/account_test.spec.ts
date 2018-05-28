export {};
// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
const translator = require('../../../strings/translator');
const accountHelper = require('../../../helpers/accounts_helper');
const tokenHelper = require('../../../helpers/id_token_helper');

jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module
const fakeDatabase = require('firebase-mock-functions');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = new fakeDatabase(functions, admin);
db.override();
db.database.autoFlush(true);

const {
    AdminRoot,
} = require('firebase-admin-mock');

describe('getLinkedAccounts', () => {
    test('1 - returns a 401 for GET calls without token', done => {
        const mockRequest = {
            method: 'GET',
            query: {userID: '1111111111'}
        };

        mockRequest.get = jest.fn();
        jest.spyOn(mockRequest, 'get').mockImplementation((header) => {
            return {
                split: () => ["123"]
            }
        })

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(401);
                return {
                    send: jest.fn(label => {
                        expect(label.toString()).toContain({error: translator.t('userNotVerified')});
                        done();
                    })
                }
            }
        };
        myFunctions.getLinkedAccounts(mockRequest, mockResponse);
    });

    test('2 - returns a 422 for not finding accounts', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'GET',
            query: {
                userID: "1231231231"
            }
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(422);
                return {
                    send: jest.fn(label => {
                        expect(label.toString()).toContain({error: translator.t('accountsFetchFailed')});
                        done();
                    })
                }
            }
        };

        myFunctions.getLinkedAccounts(mockRequest, mockResponse);
    });

    test('3 - returns a 200 with an array of accounts', async done => {
        const testArray = ["3ohRX45YYJMfec91RNBE"];
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockAccountsArray = accountHelper.getLinkedAccounts = jest.fn();

        mockAccountsArray.mockResolvedValue(testArray);

        const mockRequest = {
            method: 'GET',
            query: {userID: '1111111111'}
        };

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(array => {
                        expect(array).toBe(testArray);
                        done();
                    })
                }
            }
        };

        myFunctions.getLinkedAccounts(mockRequest, mockResponse);
    });
});

describe('link_accounts', () => {
    let admin;
    beforeEach(() => {
        admin = new AdminRoot();
        admin.initializeApp({databaseUrl: "123"});
        admin.firestore = jest.fn();
        jest.spyOn(admin, 'firestore').mockImplementation(() => {
            return {
                collection: (path) => {
                    return {
                        get: () => ["test1", "test2"]
                    }
                }
            }
        });
    });

    test('4 - returns a 422 for not finding accounts', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'GET',
            body: {userID: "1231231231"}
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(422);
                return {
                    send: jest.fn(label => {
                        expect(label.toString()).toContain({error: translator.t('accountsFetchFailed')});
                        done();
                    })
                }
            }
        };

        myFunctions.linkAccounts(mockRequest, mockResponse);
    });

    test('5 - returns a 200 with an array of accounts', async done => {
        const testArray = ["3ohRX45YYJMfec91RNBE"];
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockAccountsArray = accountHelper.getLinkedAccounts = jest.fn();
        mockAccountsArray.mockResolvedValue(testArray);

        const mockRequest = {
            method: 'GET',
            body: {userID: "123"}
        };

        mockRequest.body = jest.fn();
        jest.spyOn(mockRequest, 'body').mockImplementation(() => {
            return {
                userID: () => ["123"]
            }
        });

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(array => {
                        expect(array).toBe(testArray);
                        done();
                    })
                }
            }
        };

        myFunctions.linkAccounts(mockRequest, mockResponse);
    });
});