function mockAdmin(config) {
    function admin() {
        firestore();
        firestore = jest.fn();
        firestore().collection().get = jest.fn();

        // jest.spyOn(admin, 'firestore').mockImplementation(() => {
        //     return {
        //         collection: (path) => {
        //             return {
        //                 get: () => ["test1", "test2"]
        //             }
        //         }
        //     }
        // })
    }
    return admin;
}

module.exports = mockAdmin;
