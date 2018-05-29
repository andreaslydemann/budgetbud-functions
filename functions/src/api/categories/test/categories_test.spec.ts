export {};
// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
const translator = require('../../../strings/translator');
const tokenHelper = require('../../../helpers/id_token_helper');

jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module

describe('getCategories', () => {
    let admin;
    beforeEach(async () => {
        mockFirebase();
    });

    test('returns a 200 code and the expected return value', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');
        const objAccepted = {id: 1, data: {amount: 25, name: "test1"}};
        const objDenied = {id: 0, data: {amount: 0, name: "test2"}};

        const returnVal = {
            data: [
                objAccepted,
                objDenied
            ]
        };

        admin.firestore = jest.fn();
        jest.spyOn(admin, 'firestore').mockImplementation(() => {
            return {
                collection: (path) => {
                    return {
                        get: () => returnVal
                    }
                }
            }
        });

        const mockRequest = {
            method: 'POST',
            body: {cprNumber: '4564564564'}
        };

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(actualReturn => {
                        expect(actualReturn).toBe(objAccepted);
                        done();
                    })
                }
            }
        };
        myFunctions.getCategories(mockRequest, mockResponse);
    });
});

describe('createCategories', () => {
    beforeEach(async () => {
        mockFirebase();
    });
    test('returns a 200 for for successful creation', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const objAccepted = {categoryTypeID: 1, amount: 25};
        const objDenied = {categoryTypeID: 0, amount: 0};

        const mockRequest = {
            method: 'POST',
            body: {
                categories: [objAccepted, objDenied],
                budgetID: 123
            }
        };

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(() => {
                        done();
                    })
                }
            }
        };
        myFunctions.createCategories(mockRequest, mockResponse);
    });
});