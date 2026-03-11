const showAllReportVotes = (res, votes) => {
  res.json({ success: true, data: votes });
};

const showReportVote = (res, vote, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: vote });
};

const showDeletedReportVote = (res, id) => {
  res.json({ success: true, message: "Report vote deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllReportVotes,
  showReportVote,
  showDeletedReportVote
};
