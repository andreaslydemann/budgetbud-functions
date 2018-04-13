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

const currentMonthInterval = function () {
    const today = new Date();
    let day = String(today.getDate());
    const year = String(today.getFullYear());
    let month = String(today.getMonth() + 1);

    if (day.length < 2) day = '0' + day;
    if (month.length < 2) month = '0' + month;

    const firstDayOfMonth = "01";
    const fromDate =
        firstDayOfMonth + "-" +
        month + "-" +
        year;

    const endDate =
        day + "-" +
        month + "-" +
        year;

    return [fromDate, endDate];
};

const threeMonthInterval = function () {
    const today = new Date();

    let stringDay = String(today.getDate());
    if (stringDay.length < 2) stringDay = '0' + stringDay;

    const stringYear = String(today.getFullYear());
    let fromMonth = today.getMonth() + 1;
    let fromYear = today.getFullYear();

    if (fromMonth < 3) {
        fromMonth = 12 + (fromMonth - 3);
        fromYear = fromYear - 1;
    } else fromMonth = fromMonth - 3;

    let stringMonth = String(today.getMonth() + 1);
    if (stringMonth.length < 2) stringMonth = '0' + stringMonth;

    let stringFromMonth = String(fromMonth);
    if (stringFromMonth.length < 2) stringFromMonth = '0' + stringFromMonth;

    const stringFromYear = String(fromYear);

    const fromDate =
        stringDay + "-" +
        stringFromMonth + "-" +
        stringFromYear;

    const endDate =
        stringDay + "-" +
        stringMonth + "-" +
        stringYear;

    return [fromDate, endDate];
};

module.exports = {
    toDateString,
    toDate,
    numberOfMonthsUntilDate,
    threeMonthInterval,
    currentMonthInterval
};
