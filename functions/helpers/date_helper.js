const toDate = function (dateStr) {
    const parts = dateStr.split("-");
    return new Date(parts[2], parts[1] - 1, parts[0]);
};

module.exports = {
    toDate,
};
