export {};
// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
const tokenHelper = require('../../../helpers/id_token_helper');
const dateHelper = require('../../../helpers/date_helper');


jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module

describe('addPushToken', () => {
    let admin;
    beforeEach(async () => {
        mockFirebase();
    });

    test('returns a 200 code and the expected return value', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        admin.firestore = jest.fn();
        jest.spyOn(admin, 'firestore').mockImplementation(() => {
            return {
                collection: (path) => {
                    return {
                        where: (condition) => {
                            return {
                                update: () => ''
                            }
                        }
                    }
                }
            }
        });

        const mockRequest = {
            method: 'GET',
            body: {
                cprNumber: '4564564564',
                pushToken: 'token'
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
        myFunctions.addPushToken(mockRequest, mockResponse);
    });
});