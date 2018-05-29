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
        const obj1 = {categoryTypeID: 1, newAmount: 25};
        const obj2 = {categoryTypeID: 0, newAmount: 0};
        const budgetDoc = {data: {income: 10}};

        admin.firestore = jest.fn();
        jest.spyOn(admin, 'firestore').mockImplementation(() => {
            return {
                collection: (path) => {
                    return {
                        update: () => '',
                        get: () => budgetDoc
                    }
                }
            }
        });

        const mockRequest = {
            method: 'POST',
            body: {
                budgetID: '4564564564',
                disposable: 50,
                categories: [obj1, obj2],
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
        myFunctions.editDisposable(mockRequest, mockResponse);
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