export {};
// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
const tokenHelper = require('../../../helpers/id_token_helper');
const dateHelper = require('../../../helpers/date_helper');


jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module

describe('getDebts', () => {
    let admin;
    beforeEach(async () => {
        mockFirebase();
    });

    test('returns a 200 code and the expected return value', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const expirationDate = '1995-12-17';
        const documentID = 123;
        const expirationDateConverted = dateHelper.toDateString(new Date(expirationDate));
        const returnVal = {
            id: documentID,
            data: {expirationDate: expirationDate}
        };

        const expectedReturn = {id: documentID, debtData: {expirationDate: expirationDateConverted}}

        admin.firestore = jest.fn();
        jest.spyOn(admin, 'firestore').mockImplementation(() => {
            return {
                collection: (path) => {
                    return {
                        where: (condition) => {
                            return {
                                get: () => returnVal
                            }
                        }
                    }
                }
            }
        });

        const mockRequest = {
            method: 'GET',
            query: {budgetID: '4564564564'}
        };

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(actualReturn => {
                        expect(actualReturn).toBe(expectedReturn);
                        done();
                    })
                }
            }
        };
        myFunctions.getDebts(mockRequest, mockResponse);
    });
});