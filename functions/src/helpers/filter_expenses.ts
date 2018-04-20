const filterExpenses = function (data) {
    const filteredExpenses = [];
    data.forEach((expense) => {
        const index = filteredExpenses.findIndex(
            x => x.categoryTypeID === expense.categoryTypeID);

        if (index !== -1) {
            filteredExpenses[index].amount += expense.amount;
        } else {
            filteredExpenses.push({
                categoryTypeID: expense.categoryTypeID,
                amount: expense.amount
            });
        }
    });
    return filteredExpenses;
};

module.exports = {
    filterExpenses
};
