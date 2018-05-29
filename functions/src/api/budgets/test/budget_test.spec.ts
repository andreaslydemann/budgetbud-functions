export {};
// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
const translator = require('../../../strings/translator');
const tokenHelper = require('../../../helpers/id_token_helper');

jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module

describe('getBudget', () => {
    let admin;
    beforeEach(async () => {
        mockFirebase();
    });

    test('returns a 200 code and the expected return value', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const returnVal = {data: "test"};

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
            method: 'GET',
            query: {userID: '4564564564'}
        };

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(actualReturn => {
                        expect(actualReturn).toBe(returnVal.data);
                        done();
                    })
                }
            }
        };
        myFunctions.getBudget(mockRequest, mockResponse);
    });

    test('returns a 400 for not granting a cpr number', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'GET',
            query: {budgetID: 123}
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(400);
                return {
                    send: jest.fn(label => {
                        expect(label.toString()).toContain({error: translator.t('errorInRequest')});
                        done();
                    })
                }
            }
        };

        myFunctions.getBudget(mockRequest, mockResponse);
    });
});

describe('createBudget', () => {
    beforeEach(async () => {
        mockFirebase();
    });
    test('returns a 200 for for successful creation', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'POST',
            body: {
                userID: '4564564564',
                income: 50,
                totalGoalsAmount: 10,
                disposable: 100
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
        myFunctions.createBudget(mockRequest, mockResponse);
    });
});