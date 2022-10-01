const passedDayToStr = (passedDay) => {
  if (passedDay === 0) {
    return '오늘';
  }

  if (passedDay < 7) {
    return `${passedDay}일 전`;
  }

  if (passedDay < 30) {
    return `${Math.floor(passedDay / 7)}주 전`;
  }
};

module.exports = {
  passedDayToStr,
};
