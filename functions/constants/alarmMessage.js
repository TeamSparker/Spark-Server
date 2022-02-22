const CERTIFICATION_COMPLETE = (who, roomName) => {
  const title = `"${roomName}" 방`;
  const body = `${who}님이 인증을 완료했습니다.`;

  return { title, body, isService: false };
};

const STATUS_CONSIDERING = (who, roomName) => {
  const title = `"${roomName}" 방`;
  const body = `${who}님이 고민중 버튼을 눌렀습니다.`;

  return { title, body, isService: false };
};

const ROOM_OUT = (who, roomName) => {
  const title = '습관방 퇴장';
  const body = `${who}님이 '${roomName}' 습관방에서 퇴장했습니다.`;

  return { title, body, isService: true };
};

const SEND_SPARK = (who, body) => {
  const title = `${who}님이 보낸 스파크`;

  return { title, body, isService: false };
};

const ROOM_HALF = (roomName) => {
  const title = '반이나 왔어!';
  const body = `"${roomName}" 습관을 시작한지 33일이 지났습니다.`;

  return { title, body, isService: true };
};

const ROOM_NEW = (roomName) => {
  const title = 'Spark';
  const body = `새로운 습관방 "${roomName}"이 생성되었습니다.`;

  return { title, body, isService: true };
};

const ROOM_DELETE = (roomName) => {
  const title = '습관방 삭제';
  const body = `습관방 "${roomName}"이 삭제되었습니다.`;

  return { title, body, isService: true };
};

module.exports = {
  CERTIFICATION_COMPLETE,
  STATUS_CONSIDERING,
  ROOM_OUT,
  SEND_SPARK,
  ROOM_HALF,
  ROOM_NEW,
  ROOM_DELETE,
};
