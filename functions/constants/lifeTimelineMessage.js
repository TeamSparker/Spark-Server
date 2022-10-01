const LIFE_DECREASE = (count) => {
  const title = `생명 ${count}개 감소💧`;
  const content = `인증하지 않은 스파커가 있었네요. 응원이 더 필요해요!`;
  return { title, content };
};

const LIFE_FILL = (termDay) => {
  const title = `생명 충전 완료🔋`;
  let content = '';

  if (termDay === 1) {
    content = '66일의 도전을 시작했네요. 인증하고 생명을 지켜요!';
  } else if (termDay === 4) {
    content = '3일 달성 선물로 생명이 충전됐어요. 잘하고 있어요!';
  } else if (termDay === 8) {
    content = '7일 달성 선물로 생명이 충전됐어요. 더 힘내봐요!';
  } else if (termDay === 34) {
    content = '33일 달성 선물로 생명이 충전됐어요. 할 수 있어요!';
  } else if (termDay === 60) {
    content = '마지막 7일 선물로 생명이 충전됐어요. 끝까지 힘내요!';
  }

  return { title, content };
};

module.exports = {
  LIFE_DECREASE,
  LIFE_FILL,
};
