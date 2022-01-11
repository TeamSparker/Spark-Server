module.exports = {
  NULL_VALUE: '필요한 값이 없습니다',
  OUT_OF_VALUE: '파라미터 값이 잘못되었습니다',
  PATH_ERROR: '요청 경로가 올바르지 않습니다',
  INTERNAL_SERVER_ERROR: '서버 내부 오류',

  // 회원가입
  CREATED_USER: '회원 가입 성공',
  DELETE_USER: '회원 탈퇴 성공',
  ALREADY_SOCIALID: '이미 사용중인 소셜 아이디입니다.',
  TOO_LONG_NICKNAME: '닉네임은 10자를 초과할 수 없습니다',

  // 로그인
  LOGIN_SUCCESS: '로그인 성공',
  LOGIN_FAIL: '로그인 실패',
  NO_USER: '존재하지 않는 회원입니다.',
  MISS_MATCH_PW: '비밀번호가 맞지 않습니다.',

  // 프로필 조회
  READ_PROFILE_SUCCESS: '프로필 조회 성공',

  // Room
  CREATE_ROOM_SUCCESS: '습관 방 생성 성공',
  CREATE_ROOM_FAIL: '습관 방 생성 실패',
  GET_WAITROOM_DATA_SUCCESS: '대기방 정보 확인 완료',
  GET_WAITROOM_DATA_NULL: '참여코드와 일치하는 습관 방이 존재하지 않습니다',
  GET_WAITROOM_DATA_STARTED: '이미 습관 형성에 도전중인 방입니다',
  GET_WAITROOM_DATA_ALREADY: '이미 사용자가 참가중인 방입니다',
  GET_WAITROOM_DATA_FAIL: '대기방 정보 확인 실패',
  GET_WAITROOM_DATA_KICKED: '습관 방 생성자에 의해 내보내진 방입니다',

  // Notice
  SERVICE_READ_SUCCESS: '서비스 알림 읽음처리 완료',
  ACTIVE_READ_SUCCESS: '활동 알림 읽음처리 완료',
  SERVICE_GET_SUCCESS: '서비스 알림 조회 완료',
  ACTIVE_GET_SUCCESS: '활동 알림 조회 완료',
};
