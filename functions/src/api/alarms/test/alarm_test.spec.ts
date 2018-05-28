export {};
// You can run these unit tests by running "npm run testWithJest" inside the time-server/functions directory.
const myFunctions = require('../index');
const accountHelper = require('../../../helpers/accounts_helper');
const tokenHelper = require('../../../helpers/id_token_helper');

jest.mock('cors'); // See manual mock in ../__mocks__/cors.js
require('cors'); // Jest will return the mock not the real module

describe('getBudgetAlarms', () => {
    test('returns a 422 for not finding alarms', async done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const mockRequest = {
            method: 'GET',
            query: {budgetID: "1231231231"}
        };
        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(422);
                return {
                    send: jest.fn(label => {
                        expect(label.toString()).toContain({error: translator.t('budgetAlarmsFetchFailed')});
                        done();
                    })
                }
            }
        };

        myFunctions.getBudgetAlarms(mockRequest, mockResponse);
    });

    test('returns a 200 with an array of alarms', async done => {
        const mockTokenHelper = tokenHelper.verifyToken = jest.fn();
        mockTokenHelper.mockReturnValueOnce('');

        const collection = jest.fn();
        admin.firestore = jest.fn();
        jest.spyOn(admin, 'firestore').mockImplementation(() => {
            return {
                collection
            }
        });

        const mockAccountsArray = accountHelper.getLinkedAccounts = jest.fn();

        const alarmArray = {docs:
            [{data: {
                budgetExceeded: true,
                weeklyStatus: true
            }}]};
        mockAccountsArray.mockResolvedValue(alarmArray);

        const mockRequest = {
            method: 'GET',
            query: {budgetID: '1111111111'}
        };

        const mockResponse = {
            status: (code) => {
                expect(code).toEqual(200);
                return {
                    send: jest.fn(response => {
                        expect(response).toBe(alarmArray.docs[0].data);
                        done();
                    })
                }
            }
        };
        myFunctions.getBudgetAlarms(mockRequest, mockResponse);
    });
});