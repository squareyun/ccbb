import React, { useState } from "react";
import * as S from "./style";
import Input1 from "../../../component/common/inputs/input1";
import Button1 from "../../../component/common/buttons";
import { Link } from "react-router-dom";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = () => {
    console.log("로그인합시다");
    console.log("id: " + email);
    console.log("pw: " + password);
  };
  const handleOnKeyPress = (e) => {
    if (e.key === "Enter") {
      //이메일, 패스워드 중 하나라도 비어있으면 리턴시킴
      console.log("엔터키입력");
      doLogin(); // Enter 입력이 되면 클릭 이벤트 실행
    }
  };

  return (
    <S.bg>
      <S.Img
        src="/resource/Logo.png"
        alt="CC.BB"
        style={{ width: "200px", height: "60px" }}
      />
      <Input1
        label="이메일"
        id="idInput"
        width="300px"
        height="40px"
        onKeyPress={handleOnKeyPress}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <Input1
        label="패스워드"
        id="passwordInput"
        width="300px"
        height="40px"
        type="password"
        onKeyPress={handleOnKeyPress}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <Button1
        text={"로그인"}
        width={"100%"}
        height={"50px"}
        onClick={doLogin}
      />

      <a href="http://localhost:8081/api/oauth2/authorization/kakao">
        kakao(localhost:8081)
      </a>
      <a href="http://ccbb.pro/api/oauth2/authorization/kakao">
        kakao(ccbb.pro)
      </a>
      <a href="http://ccbb.pro/api/oauth2/authorization/kakao">
        <img
          src="/resource/kakao_login_large_wide.png"
          alt="kakao-login"
          style={{ width: "300px" }}
        />
      </a>
      <S.signinMenu>
        <Link to="/signup">
          <p>회원가입</p>
        </Link>
        <Link to="/">
          <p>패스워드 찾기</p>
        </Link>
      </S.signinMenu>
    </S.bg>
  );
}
