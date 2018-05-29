const mockFirebase = () => {
    spyOn(admin, 'initializeApp')

    spyOn(admin, 'auth' as any).and.returnValue({
        initializeApp: jest.fn(),
        verifyIdToken: jest.fn().mockReturnValue(Promise.resolve({ uid: 'UID' })),
        getUser: jest.fn().mockReturnValue(Promise.resolve({
            uid: 'UID',
            displayName: 'displayName',
            email: 'email',
        })),
    });

    spyOn(functions, 'config' as any).and.returnValue({
        firebase: {},
        sendgrid: {
            apikey: 'apikey',
        },
    });

    spyOn(mail, 'send').and.returnValue(Promise.resolve(void 0))
};

module.exports = {
    mockFirebase
};
