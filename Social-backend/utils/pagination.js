const getPagination = (page, limit) => {
  const currentPage = parseInt(page) || 1;

  const pageLimit = parseInt(limit) || 10;

  const skip = (currentPage - 1) * pageLimit;

  return {
    skip,
    pageLimit,
  };
};

module.exports = getPagination;