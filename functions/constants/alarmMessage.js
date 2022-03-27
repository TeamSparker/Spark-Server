const CERTIFICATION_COMPLETE = (who, roomName) => {
  const title = `${who}님의 인증 완료!`;
  const body = `${roomName}방 인증을 완료했어요.`;
  const isService = false;
  const category = 'certification';

  return { title, body, isService, category };
};

const STATUS_CONSIDERING = (who, roomName) => {
  const title = `${who}님 고민중..💭`;
  const body = `${roomName}, 오늘 좀 힘든걸? 스파크 plz`;
  const isService = false;
  const category = 'consider';

  return { title, body, isService, category };
};

const ROOM_OUT = (who, roomName) => {
  const title = `${roomName}방 인원 변동 🚨`;
  const body = `${who}님이 습관방에서 나갔어요.`;
  const isService = false;

  return { title, body, isService };
};

const SEND_SPARK = (who, roomName, content) => {
  const title = `${roomName}방에서 보낸 스파크`;
  const isService = false;
  const category = 'spark';
  const body = `${who} : ${content}`;

  return { title, body, isService, category };
};

const ROOM_NEW = (roomName) => {
  const title = `새로운 습관 시작 🔥`;
  const body = `${roomName}방에서 가장 먼저 스파크를 보내볼까요?`;
  const isService = true;
  const category = 'roomStart';

  return { title, body, isService, category };
};

const ROOM_DELETE = (roomName) => {
  const title = `${roomName} 대기방 삭제`;
  const body = `방 개설자에 의해 대기방이 삭제되었어요.`;
  const isService = true;

  return { title, body, isService };
};

const FEED_LIKE = (who, roomName) => {
  const title = `${who}님이 좋아한 피드`;
  const body = `${roomName}방 인증을 좋아해요.`;
  const isService = false;

  return { title, body, isService };
};

const REMIND_ALERT = () => {
  const title = `🚨비상🚨`;
  const body = `미완료 습관방 발견! 👀 얼른 생명 지키러 가요!`;
  const isService = true;

  return { title, body, isService };
};

module.exports = {
  CERTIFICATION_COMPLETE,
  STATUS_CONSIDERING,
  ROOM_OUT,
  SEND_SPARK,
  ROOM_NEW,
  ROOM_DELETE,
  FEED_LIKE,
  REMIND_ALERT,
};
