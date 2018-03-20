const toDateString = function (date) {
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    const year = String(date.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return `${month}-${day}-${year}`;
};

const toDate = function (dateStr) {
    const parts = dateStr.split("-");
    return new Date(parts[2], parts[1] - 1, parts[0]);
};

module.exports = {
    toDateString,
    toDate,
};
