export {};
const myFunctions = require('../index');
const translator = require('../../../strings/translator');
const tokenHelper = require('../../../helpers/id_token_helper');

jest.mock('cors');
require('cors');

describe('deleteUser', () => {
    beforeEach(async () => {
        mockFirebase();
    });
    test('returns a 200 for for successful deletion', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'POST',
            body: {cprNumber: '4564564564'}
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
        myFunctions.deleteUser(mockRequest, mockResponse);
    });

    test('returns a 400 for not granting a cpr number', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'POST',
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(400);
                return {
                    send: jest.fn(label => {
                        expect(label.toString()).toContain({error: translator.t('cprNumberNotReceived')});
                        done();
                    })
                }
            }
        };

        myFunctions.deleteUser(mockRequest, mockResponse);
    });
});

describe('createUser', () => {
    beforeEach(async () => {
        mockFirebase();
    });
    test('returns a 200 for for successful creation', done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'POST',
            body: {cprNumber: '4564564564'}
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
        myFunctions.createUser(mockRequest, mockResponse);
    });
});