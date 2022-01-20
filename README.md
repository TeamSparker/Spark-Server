## 🔥 Spark Server, &nbsp;A large fire comes from small spark

> WE SOPT 29th APPJAM <br>
> 친구와 함께하는 66일간의 습관 형성 서비스! <br>
> 프로젝트 기간 : 2022. 01. 03. ~ 2022. 01. 22.

![KakaoTalk_Photo_2022-01-20-14-51-19](https://user-images.githubusercontent.com/39653584/150315358-def388b9-9ed5-451c-abc8-678520ad1d09.png)

---

## ❤️‍🔥 Server Sparkers

| 정설희 | 김영권 | 박정현 |
| :---: | :---: | :---: | 
|<img src="https://user-images.githubusercontent.com/39653584/150314775-cf8ad96d-3bf8-4a76-a9a0-1d39baac179f.png" width="200px" height="200px">| <img src="https://user-images.githubusercontent.com/39653584/150314721-214a6633-a627-4f4f-80d2-1c1dfdbf4c3f.png" width="200px" height="200px"> | <img src="https://user-images.githubusercontent.com/39653584/150314852-1d15d37c-42b4-40ba-9f81-d96b4ee7e759.png" width="200px" height="200px"> |
|[xxeol2](https://github.com/xxeol2)| [youngkwon02](https://github.com/youngkwon02)| [junghyun-jacky](https://github.com/junghyun-jacky)| |


---

## 🔥 Branding

![영권쌤 거](https://user-images.githubusercontent.com/39653584/150317112-aa048eba-ee94-4711-99dd-89dcb3c2746e.png)

---

## ⭐️ IA

![IA](https://user-images.githubusercontent.com/71129059/148944129-5fd8c834-699d-40e6-b129-bdb06eb21596.png)

---

## 📚 API Document

### &nbsp;&nbsp;[Spark API Document ✨](https://www.notion.so/API-94b97e62a8b84769a784d86992287119)

---

## 📑 ERD

<img src="https://user-images.githubusercontent.com/39653584/150285337-1c0dbbd0-a8d7-4e79-9528-d0ffb529b04b.png" width="500px">

---

## 🧩 Convention
<details>
<summary>Branch Strategy</summary>
<div markdown="1">

```
main → develop → feature/#3(issue num)
    
1. `feature`에서 각자 기능 작업
2. 작업 완료 후 `develop`에 PR
3. 코드 리뷰 후 Confirm 받고 Merge
4. develop 에 Merge 될 때 마다 **모든 팀원 develop pull** 받아 최신 상태 유지
```
</div>
</details>

<details>
<summary>Commit Convention</summary>
<div markdown="1">

| 태그 이름 | 설명 |
| --- | --- |
| feat | 새로운 기능을 추가할 경우 |
| fix | 버그를 고친 경우 |
| !BREAKING CHANGE | 커다란 API 변경의 경우 |
| HOTFIX | 급하게 치명적인 버그를 고쳐야 하는 경우 |
| style | 코드 포맷 변경, 세미 콜론 누락, 코드 수정이 없는 경우 |
| comment | 필요한 주석 추가 및 변경 |
| docs | 문서를 수정한 경우 (ex. README 수정) |
| rename | 파일 혹은 폴더명을 수정하거나 옮기는 작업인 경우 |
| remove | 파일을 삭제하는 작업만 수행한 경우 |
| chore | 빌드 태스크 업데이트, 패키지 매니저를 설정하는 경우 |
    
</div>
</details>

<details>
<summary>Coding Convention</summary>
<div markdown="1">
<br>
    
1. **변수명**
    
- Camel Case 사용 (lower Camel Case)
- 함수의 경우 동사 + 명사 사용
- Class, Contructor는 *Pascal Case(=upper 카멜 케이스)*를 사용한다.
- 글자의 길이는 20자 이내로 제한한다.
- 4단어 이상이 들어가거나, 부득이하게 20자 이상이 되는 경우 팀원과의 상의를 거친다.
- Boolean의 경우 조동사+flag 종류로 구성된다. ex) isNum, hasNum
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

---
    
2. **주석 규칙**
    
- 한줄은 //로 적고, 그 이상은 /** */로 적는다.
    
```jsx
    // 한줄 주석일 때
    /**
     * 여러줄
     * 주석일 때
     */
```
    
- 함수에 대한 주석
    
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

---
    
3. **bracket({}) 규칙**
    
- if문의 실행문이 한 줄일 때
        
    ```jsx
        if(trigger) {
          return;
        }
        // logic start
    ```

---
    
4. **괄호 사용**
    
- (if, while, for)문 괄호 뒤에 한칸을 띄우고 사용한다.
        
    ```jsx
        if (left == true) {
        	// logic
        }
    ```

---
    
5. **띄어쓰기**
    
    ```jsx
    let a = 5;  (= 양쪽 사이로 띄어쓰기 하기)
    if (a == 3) {
    	// logic
    }
    ```
    
6. **비동기 함수의 사용**

- Promise함수의 사용은 지양하고 async, await를 사용하도록 한다.
    
7. **DataBase Naming**
    
- table 명 : 소문자 (ex. user)
- 필드명 : snake_case (ex. user_id)
    
</div>
</details>
 
---
    
### 📁 Foldering

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

---

### 📌 Dependencies Modules
```JSON
{
  "name": "functions",
  "description": "Spark Server",
  "scripts": {
    "lint": "eslint .",
    "serve": "cross-env NODE_ENV=development firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "cross-env NODE_ENV=production firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "12"
  },
  "main": "index.js",
  "dependencies": {
    "axios": "^0.24.0",
    "busboy": "^0.3.1",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "cross-env": "^7.0.3",
    "dayjs": "^1.10.7",
    "dotenv": "^10.0.0",
    "eslint-config-prettier": "^8.3.0",
    "express": "^4.17.2",
    "firebase": "^9.5.0",
    "firebase-admin": "^9.12.0",
    "firebase-functions": "^3.11.0",
    "helmet": "^4.6.0",
    "hpp": "^0.2.3",
    "jsonwebtoken": "^8.5.1",
    "lodash": "^4.17.21",
    "multer": "^1.4.3",
    "nanoid": "^3.1.30",
    "node-schedule": "^2.1.0",
    "pg": "^8.7.1"
  },
  "devDependencies": {
    "eslint": "^7.6.0",
    "eslint-config-google": "^0.14.0",
    "firebase-functions-test": "^0.2.0"
  },
  "private": true
}
```
