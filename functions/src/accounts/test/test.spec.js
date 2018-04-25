// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
// const myFunctions = require('../../../lib/accounts/get_linked_accounts');
const admin = require('firebase-admin');
const firebaseMock = require('firebase-mock');
const mockauth = new firebaseMock.MockFirebase();
const mockfirestore = new firebaseMock.MockFirestore();
const myFunctions = require('../index');
const translator = require('../../strings/translator');
const request = require('request');
const mockToken = require('./mocks');

const mockSdk = new firebaseMock.MockFirebaseSdk(null, function () {
    return mockauth;
}, function () {
    return mockfirestore;
});

class MockRequest {
    constructor() {
        // this.method = 'GET';
        // this.query = {
        //     userID: "1111111111"
        // }
    }

    get query() {
        return {
            userID: "1111111111"
        };
    }

    get() {
        const idToken = mockToken.generateIdToken();
        return "Bearer " + idToken;
    }
}

jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module

let testToken;
let mockRequestMethod = new MockRequest();

beforeAll(async (done) => {
    mockSdk.auth().autoFlush();

// create user
    mockSdk.auth().createUser({
        uid: '123',
        email: 'test@test.com',
        password: 'abc123'
    });

    try {
        mockSdk.auth().getUser('123').then(function (user) {
            user.getIdToken().then(function (token) {
                testToken = token;
                done();
            })
        })
    } catch (err) {
        // console.log("TestMsg " + err)
    }

});


describe('getLinkedAccounts', () => {

    test('returns a 401 for GET calls without token', done => {
        const mockRequest = mockRequestMethod;
        // console.log(mockRequest.get('Authorization').split('Bearer ')[1]);
        const mockResponse = {
            status: (code) => {
                // expect(code).toEqual(422);
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
    //
    // test('returns a 422 for not finding accounts', done => {
    //     const mockRequest = {
    //         method: 'GET',
    //         query: {
    //             userID: "11111111111111111"
    //         }
    //     };
    //     const mockResponse = {
    //         status: (code) => {
    //             expect(code).toEqual(422);
    //             return {
    //                 send: jest.fn(label => {
    //                     expect(label).toBe('Kunne ikke hente konti.');
    //                     done();
    //                 })
    //             }
    //         }
    //     };
    //     myFunctions.getLinkedAccounts(mockRequest, mockResponse);
    // });
    //
    test('returns a 200 with an array of accounts', async done => {
        const mockRequest = mockRequestMethod;
        const mockResponse = {
            status: (code) => {
                // expect(code).toEqual(200);
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
