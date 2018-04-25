const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const admin = require('firebase-admin');
import { expect } from 'chai';
import 'mocha';

describe('Cloud Functions', () => {
    let myFunctions, adminInitStub;

    before(() => {
        adminInitStub = sinon.stub(admin, 'initializeApp');
        myFunctions = require('../index');
    });

    after(() => {
        // Restore admin.initializeApp() to its original method.
        adminInitStub.restore();
    });

    // describe('makeUpperCase', () => {
    //     it('should upper case input and write it to /uppercase', () => {
    //         const childParam = 'uppercase';
    //         const setParam = 'INPUT';
    //         const childStub = sinon.stub();
    //         const setStub = sinon.stub();
    //         // [START fakeSnap]
    //         // The following lines creates a fake snapshot, 'snap', which returns 'input' when snap.val() is called,
    //         // and returns true when snap.ref.parent.child('uppercase').set('INPUT') is called.
    //         const snap = {
    //             val: () => 'input',
    //             ref: {
    //                 parent: {
    //                     child: childStub,
    //                 }
    //             }
    //         };
    //         childStub.withArgs(childParam).returns({ set: setStub });
    //         setStub.withArgs(setParam).returns(true);
    //         // [END fakeSnap]
    //         // Wrap the makeUppercase function.
    //         const wrapped = test.wrap(myFunctions.makeUppercase);
    //         // Since we've stubbed snap.ref.parent.child(childParam).set(setParam) to return true if it was
    //         // called with the parameters we expect, we assert that it indeed returned true.
    //         return assert.equal(wrapped(snap), true);
    //         // [END assertOffline]
    //     })
    // });

    describe('getLinkedAccounts', () => {
        let oldDatabase;
        before(() => {
            // Save the old database method so it can be restored after the test.
            oldDatabase = admin.database;
        });

        after(() => {
            // Restoring admin.database() to the original method.
            admin.database = oldDatabase;
        });

        it('should return a 303 redirect', (done) => {
            const databaseStub = sinon.stub();
            const accountArray = ["3ohRX45YYJMfec91RNBE"];
            let userID = 1111111111;

            // The following lines override the behavior of admin.database().ref('/messages')
            // .push({ original: 'input' }) to return a promise that resolves with { ref: 'new_ref' }.
            // This mimics the behavior of a push to the database, which returns an object containing a
            // ref property representing the URL of the newly pushed item.

            Object.defineProperty(admin, 'firestore', { get: () => databaseStub });
            databaseStub.collection("linkedAccounts")
                .where("userID", "==", userID)
                .get().returns(Promise.resolve({ id: "3ohRX45YYJMfec91RNBE" }));

            // [START assertHTTP]
            // A fake request object, with req.query.text set to 'input'
            const req = { query: {userID: '1111111111'} };
            // A fake response object, with a stubbed redirect function which asserts that it is called
            // with parameters 303, 'new_ref'.
            const res = {
                send: (code, result) => {
                    assert.equal(code, 200);
                    assert.equal(result, accountArray);
                    done();
                }
            };

            // Invoke addMessage with our fake request and response objects. This will cause the
            // assertions in the response object to be evaluated.
            myFunctions.getLinkedAccounts(req, res);
            // [END assertHTTP]
        });
    });
})