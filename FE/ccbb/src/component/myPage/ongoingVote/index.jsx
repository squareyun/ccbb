import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as S from "./style";
import ProcessBtn from "../processBtn";
import VotePreview from "../../votePreview";
import Button1 from "../../common/buttons";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HowToVoteOutlinedIcon from "@mui/icons-material/HowToVoteOutlined";
import DirectionsWalkOutlinedIcon from "@mui/icons-material/DirectionsWalkOutlined";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import DoubleArrowOutlinedIcon from "@mui/icons-material/DoubleArrowOutlined";
import { ccbbApi } from "../../../api/ccbbApi";
// import VoteRate from "../../voteBoard/voteRate";

export default function OngoingVote() {
  const [myVoteList, SetMyVoteList] = useState([]);
  const processList = [
    {
      icon: HandshakeOutlinedIcon,
      title: "수락 대기중",
    },
    {
      icon: HowToVoteOutlinedIcon,
      title: "투표 진행중",
    },
    {
      icon: DirectionsWalkOutlinedIcon,
      title: "공약 이행중",
    },
    {
      icon: CurrencyExchangeOutlinedIcon,
      title: "보증금 반환",
    },
  ];

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  React.useEffect(() => {
    ccbbApi
      .get("/post/vote/participationList", { headers })
      .then((res) => {
        SetMyVoteList(res.data.participationList);
      })
      .catch((e) => console.log(e));
  }, []);

  const dummyVotes = [
    {
      title: "시시비비",
      postId: 1,
      createDate: "2023-11-09",
      commentCount: 4,
      userCount: 100,
    },
    {
      title: "를",
      postId: 1,
      createDate: "2023-11-09",
      commentCount: 10,
      userCount: 1,
    },
    {
      title: "가려주세요",
      postId: 1,
      createDate: "2023-11-09",
      commentCount: 10,
      userCount: 100000,
    },
    {
      title: "ㅎㅎ",
      postId: 1,
      createDate: "2023-11-09",
      commentCount: 600,
      userCount: 100,
    },
  ];

  return (
    <S.main>
      <S.CountAndBtn>
        <span className="total-count">{dummyVotes.length}건</span>
        <Link to="/lolvote/create">
          <Button1 text={"투표 만들기"} width={"120px"} height={"30px"} />
        </Link>
      </S.CountAndBtn>
      {dummyVotes.map((vote, index) => {
        return <VotePreview key={index} {...vote} />;
      })}
      {/* <Link to="/lolvote">
        <h1>이거누구탓임</h1>
      </Link>
      <S.processChart>
        {processList.map((proc, index) => {
          return (
            <React.Fragment key={index}>
              <S.processStep>
                <ProcessBtn
                  Icon={proc.icon}
                  isOngoing={proc.title === "수락 대기중"}
                />
                <p>{proc.title}</p>
              </S.processStep>
              {!(index === 3) && (
                <DoubleArrowOutlinedIcon
                  key={proc.title}
                  className="arrow"
                  style={{ width: "7vw", height: "7vw" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </S.processChart>
      <VoteRate /> */}
    </S.main>
  );
}
