module.exports = {
  NULL_VALUE: '필요한 값이 없습니다',
  OUT_OF_VALUE: '파라미터 값이 잘못되었습니다',
  PATH_ERROR: '요청 경로가 올바르지 않습니다',
  INTERNAL_SERVER_ERROR: '서버 내부 오류',
  PRIV_NOT_FOUND: '권한이 없는 요청입니다',
  INVALID_LASTID: '잘못된 lastid 입니다',

  // 회원가입
  CREATED_USER: '회원 가입 성공',
  DELETE_USER: '회원 탈퇴 성공',
  ALREADY_SOCIALID: '이미 사용중인 소셜 아이디입니다.',
  TOO_LONG_NICKNAME: '닉네임은 10자를 초과할 수 없습니다',
  NOT_SIGNED_UP: '회원가입을 하지 않은 사용자입니다',
  ALREADY_SIGNED_UP: '회원 정보를 불러왔습니다',

  // 로그인
  LOGIN_SUCCESS: '로그인 성공',
  LOGIN_FAIL: '로그인 실패',
  NO_USER: '존재하지 않는 회원입니다.',
  MISS_MATCH_PW: '비밀번호가 맞지 않습니다.',

  // 사용자 프로필
  GET_USER_PROFILE_SUCCESS: '프로필 조회 성공',
  PATCH_USER_PROFILE_SUCCESS: '프로필 변경 성공',

  // Room
  CREATE_ROOM_SUCCESS: '습관 방 생성 성공',
  CREATE_ROOM_FAIL: '습관 방 생성 실패',
  GET_WAITROOM_DATA_SUCCESS: '대기방 정보 확인 완료',
  GET_WAITROOM_DATA_IMPOSSIBLE: '참여할 수 없는 코드예요.',
  GET_WAITROOM_DATA_NULL: '존재하지 않는 코드예요.',
  GET_WAITROOM_DATA_STARTED: '이미 습관 형성에 도전중인 방입니다',
  GET_WAITROOM_DATA_ALREADY: '이미 참여 중인 코드에요.',
  GET_WAITROOM_DATA_FAIL: '대기방 정보 확인 실패',
  GET_WAITROOM_DATA_KICKED: '습관 방 생성자에 의해 내보내진 방입니다',
  GET_WAITROOM_DATA_FULL: '정원이 가득찬 습관방입니다',
  ENTER_ROOM_SUCCESS: '습관 방 참여 완료',
  ENTER_ROOM_FAIL: '습관 방 참여 실패',
  ENTER_ROOM_ALREADY: '이미 참여중인 습관 방입니다',
  ROOM_ID_INVALID: '올바르지 않은 roomId입니다',
  PURPOSE_SET_SUCCESS: '목표 설정 성공',
  ROOM_ID_NOT_FOUND: '유효하지 않은 roomId입니다',
  GET_ROOM_DATA_FAIL: '존재하지 않는 습관방입니다',
  NOT_ONGOING_ROOM: '현재 진행중인 습관방이 아닙니다',
  NOT_MEMBER: '참여중인 습관방이 아닙니다',
  GET_ROOM_LIST_SUCCESS: '참여중인 습관방 조회 완료',
  GET_ROOM_DETAIL_SUCCESS: '특정 습관방 상세조회 성공',
  NOT_MATCH_ROOM_AND_RECORD: '해당 습관방의 record가 아닙니다',
  NOT_STARTED_ROOM: '아직 대기중인 방입니다',

  START_ROOM_SUCCESS: '습관 방 시작 완료',
  START_ROOM_ALREADY: '이미 시작된 방입니다',
  DONE_OR_REST_MEMBER: '습관 인증 완료 혹은 쉴래요 한 사용자입니다',
  CERTIFY_SUCCESS: '습관인증 업로드 성공',
  ROOM_OUT_SUCCESS: '습관 방 퇴장 완료',

  // Feed
  GET_FEED_SUCCES: '피드 조회 성공',
  RECORD_ID_NOT_VALID: '유효하지 않은 recordId입니다',
  SEND_LIKE_SUCCESS: '좋아요 성공',
  CANCEL_LIKE_SUCCESS: '좋아요 취소 성공',

  // Spark
  CANNOT_SEND_SPARK_SELF: '자기자신에게 스파크를 보낼 수 없습니다',
  SEND_SPARK_SUCCESS: '스파크 전송 선공',

  // Myroom
  GET_MYROOM_SUCCESS: '보관함 리스트 불러오기 성공',
  GET_MYROOM_DETAIL_SUCCESS: '인증사진 모아보기 성공',

  // Notice
  SERVICE_READ_SUCCESS: '서비스 알림 읽음처리 완료',
  ACTIVE_READ_SUCCESS: '활동 알림 읽음처리 완료',
  SERVICE_GET_SUCCESS: '서비스 알림 조회 완료',
  ACTIVE_GET_SUCCESS: '활동 알림 조회 완료',
  NOTICE_DELETE_SUCCESS: '알림 삭제 완료',
  NOTICE_ID_NOT_VALID: '유효하지 않은 알림 ID 입니다',
  PUSH_SEND_SUCCESS: '푸시알림 전송 완료',

  // Status
  INVALID_USER_STATUS: '유효하지 않은 status type입니다',
  CERTIFICATION_ALREADY_DONE: '이미 인증을 완료하였습니다',
  REST_ALREADY_DONE: '이미 쉴래요를 사용한 사용자입니다',
  UPDATE_STATUS_SUCCESS: '상태 변경 완료',
  REST_COUNT_ZERO: '쉴래요 사용 가능 횟수가 0인 사용자입니다',

  // Token
  TOKEN_EXPIRED: '만료된 토큰입니다',
  TOKEN_INVALID: '유효하지 않은 토큰입니다',
};
