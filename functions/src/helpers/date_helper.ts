const toDateString = function (date) {
    let day = String(date.getDate());
    let month = String(date.getMonth() + 1);
    const year = String(date.getFullYear());

    if (day.length < 2) day = '0' + day;
    if (month.length < 2) month = '0' + month;

    return `${day}-${month}-${year}`;
};

const toDate = function (dateStr) {
    const parts = dateStr.split("-");
    return new Date(parts[2], parts[1] - 1, parts[0]);
};

const numberOfMonthsUntilDate = function (endDate) {
    const startDate = new Date();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    let startMonth = startDate.getMonth();
    let endMonth = endDate.getMonth();

    if (startMonth === 0) {
        startMonth++;
        endMonth++;
    }

    return ((endYear - startYear) * 12 + (endMonth - startMonth) + 1);
};

module.exports = {
    toDateString,
    toDate,
    numberOfMonthsUntilDate
};
