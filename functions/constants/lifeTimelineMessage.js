const LIFE_DECREASE = (count) => {
  const title = `생명 ${count}개 감소💧`;
  const content = `인증하지 않은 스파커가 있었네요. 응원이 더 필요해요!`;
  return { title, content };
};

module.exports = {
  LIFE_DECREASE,
};
