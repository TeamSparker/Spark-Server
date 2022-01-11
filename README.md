# Spark-Server
서버는🗿🔪서걱..서걱,,,석...썩...써파크🎇

# Spark-Server

## **⚡️프로젝트 소개 : ⭐️SPARK⭐️**

1️⃣ `기존`끝없이 반복되는 66일의 굴레 가능성→ `디벨롭`‘66일 동안 한 팀당 주어지는 총 세 번의 기회’

2️⃣ `기존`'칭찬하기'와 '스파크 보내기' → `디벨롭`'스파크 보내기'로 통합

3️⃣ 타이머 인증 : 사진인증은 디폴트로 두고, 방을 만드는 사람이 인증 방식을 선택할 수 있도록!

4️⃣ 기존 와프보다 디테일해진 습관 등록 과정

5️⃣ 대기방 : 친구들이 모두 모일 때까지 기다리는 도중에도 습관 인증 가능

## IA
![IA](https://user-images.githubusercontent.com/71129059/148944129-5fd8c834-699d-40e6-b129-bdb06eb21596.png)

## API 명세서 및 구현 진척도

[https://jealous-supernova-274.notion.site/API-94b97e62a8b84769a784d86992287119](https://www.notion.so/API-94b97e62a8b84769a784d86992287119)

## ERD
<img src = "https://user-images.githubusercontent.com/71129059/148944200-68654657-3cef-4301-82be-4b8be849269d.png" width="400">

## Branch Strategy

```
Git workflow

main → develop → feature/#3(issue num)
1. `feature`에서 각자 기능 작업
2. 작업 완료 후 `develop`에 PR
3. 코드 리뷰 후 Confirm 받고 Merge
4. develop 에 Merge 될 때 마다 **모든 팀원 develop pull** 받아 최신 상태 유지
```
</aside>

## Commit Convention

**태그: 제목의 형태**

**(ex. feat: 프로필 조회 API)**

| 태그 이름 | 설명 |
| --- | --- |
| feat | 새로운 기능을 추가할 경우 |
| fix | 버그를 고친 경우 |
| !BREAKING CHANGE | 커다란 API 변경의 경우 |
| !HOTFIX | 급하게 치명적인 버그를 고쳐야 하는 경우 |
| style | 코드 포맷 변경, 세미 콜론 누락, 코드 수정이 없는 경우 |
| comment | 필요한 주석 추가 및 변경 |
| docs | 문서를 수정한 경우 (ex. README 수정) |
| rename | 파일 혹은 폴더명을 수정하거나 옮기는 작업인 경우 |
| remove | 파일을 삭제하는 작업만 수행한 경우 |
| chore | 빌드 태스크 업데이트, 패키지 매니저를 설정하는 경우 |

## Coding Convention

- Coding Convention
    
    ### 1. 변수명
    
    - Camel Case 사용 (lower Camel Case)
        - camelCase
    - 함수의 경우 동사 + 명사 사용
        - getUserInformation()
    - Class, Contructor는 *Pascal Case(=upper 카멜 케이스)*를 사용한다.
        
        ex) CamelCase
        
    - 글자의 길이
        - 글자의 길이는 20자 이내로 제한한다.
        - 4단어 이상이 들어가거나, 부득이하게 20자 이상이 되는 경우 팀원과의 상의를 거친다.
    - flag로 사용되는 변수
        - Boolean의 경우 조동사+flag 종류로 구성된다. ex) isNum, hasNum
    - 약칭의 사용
        - 약어는 되도록 사용하지 않는다.
        
        ```jsx
        let idx; // bad
        let index; // good
        
        let cnt; // bad
        let count; // good
        
        let arr; // bad
        let array; // good
        
        let seoul2Bucheon; // bad
        let seoulToBucheon; // good
        ```
        
        - 부득이하게 약어가 필요하다고 판단되는 경우 팀원과의 상의를 거친다.
    
    ### 2. **주석 규칙**
    
    한줄은 //로 적고, 그 이상은 /** */로 적는다.
    
    ```jsx
    // 한줄 주석일 때
    /**
     * 여러줄
     * 주석일 때
     */
    ```
    
    함수에 대한 주석
    
    ```jsx
    /**
     *  @챌린지_회고_댓글_등록
     *  @route POST /:challengeID/comment
     *  @body parentID, text
     *  @error
     *      1. 챌린지 id 잘못됨
     *      2. 요청 바디 부족
     *      3. 부모 댓글 id 값이 유효하지 않을 경우
     */
    ```
    
    ### 3. **bracket({}) 규칙**
    
    if문의 실행문이 한 줄일 때
    
    - 반복문, 함수의 탈출
        - 여러 줄로 작성한다.
        
        ```jsx
        if(trigger) {
          return;
        }
        // logic start
        ```
        
    
    ### 4. 괄호 사용
    
    - (if, while, for)문 괄호 뒤에 한칸을 띄우고 사용한다.
        
        ```jsx
        if (left == true) {
        	// logic
        }
        ```
        
    
    ### 5. 띄어쓰기
    
    ```jsx
    let a = 5;  ( = 양쪽 사이로 띄어쓰기 하기)
    if (a == 3) {
    	// logic
    }
    ```
    
    ### 6. **비동기 함수의 사용**
    
    Promise함수의 사용은 지양하고 async, await를 사용하도록 한다.
    
    ### 7. DataBase Naming
    
    - table 명 - 소문자 (ex. user)
    - 필드명 - snake_case (ex. user_id)
    

## Foldering

```
|-📋 .firebaserc
|-📋 firebase.json
|-📋 .gitignore
|-📁 functions_
               |- 📋 index.js
               |- 📋 package.json
               |- 📋 .gitignore
               |- 📋 .env
               |- 📁 api_ 
               |         |- 📋 index.js
               |         |- 📁 routes_
               |                      |- 📋 index.js
               |
               |- 📁 config_ 
               |            |- 📋 dbConfig.js
               |            |- 📋 firebaseClient.js
               |
               |- 📁 constants_
               |               |- 📋 jwt.js
               |               |- 📋 responseMessage.js
               |               |- 📋 statusCode.js
               |
               |- 📁 db_ 
               |        |- 📋 db.js
               |        |- 📋 index.js
               |
               |- 📁 lib_
               |         |- 📋 convertSnakeToCamel.js
               |         |- 📋 jwtHandler.js
               |         |- 📋 util.js
               |
               |- 📁 middlewares_
                                 |- 📋 auth.js
                                 |- 📋 uploadImage.js
                                 |- 📋 slackAPI.js
```

## Role

| Name | Role |
| --- | --- |
| 정설희 | DB 설계, API 명세서 작성, 회원가입/프로필/특정습관방조회 API |
| 박정현 | DB 설계, API 명세서 작성, 피드/마이룸/습관방 조회 API |
| 김영권 | DB 설계, API 명세서 작성, 습관방 생성 및 참여/알림 API |
