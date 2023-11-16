import ReactPlayer from "react-player";
import Headermenu from "../../../../component/common/headers/headermenu";
import * as S from "./style";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PromisePage from "./promisePage";
import UserProfile from "../../../../component/common/profile";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InputComment from "../../../../component/common/inputs/inputcomment";
import CommentBox from "../../../../component/commentBox";
import { ccbbApi } from "../../../../api/ccbbApi";
import { useRecoilValue } from "recoil";
import { userState } from "../../../../recoil/UserAtom";
import VotePaymentModal from "../lolvoteCreate/votePaymentpage";
import Button1 from "../../../../component/common/buttons";
import TierImg from "../../../../component/tier";
import VoteProcess from "../../../../component/voteBoard/voteProcess";
import { intervalToDuration, isBefore } from "date-fns";
import { isAfter } from "date-fns";
import VoteRate from "../../../../component/voteBoard/voteRate";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";
export default function LoLvoteDetailPage() {
  const userInfo = useRecoilValue(userState);
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const postId = useParams().postId;
  const [curPost, SetCurPost] = useState({
    title: "",
    content: "",
    vote: {
      promise: "",
      argument: "",
    },
  });
  const [comments, SetComments] = useState([]);
  const [isPromisePageOpen, setIsPromisePageOpen] = useState(false);
  const [isWard, setIsWard] = useState(false);
  const [isThumbUp, setIsThumbup] = useState(false);
  const [isThumbDown, setIsThumbDown] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [payment, setPayment] = useState(null);
  const token1 = localStorage.getItem("token");
  const [userPick, setUserPick] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalOpen, setIsOpenModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(""); // 종료일 나타내기 위해서
  const [voteResult, setVoteResult] = useState({ pick1: 0, pick2: 0 });
  const [user1, setUser1] = useState(""); // 누가이겼는지 확인하기위해
  const [user2, setUser2] = useState(""); // 누가이겼는지 확인하기위해
  const [curUser, setCurUser] = useState("");
  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pId, setPId] = useState("");
  const [dPromise, setDPromise] = useState(null);
  const [promiseFile, setPromiseFile] = useState({
    hasPromise: false,
    fileType: null,
  });
  const fetchPost = () => {
    const headers = {
      Authorization: `Bearer ${token1}`,
    };

    return ccbbApi.get("/post/vote/detail", {
      params: { postId: postId },
    });
  };

  useEffect(() => {
    fetchPost().then((res) => {
      let user1 = res.data.voteList.vote.user1;
      let user2 = res.data.voteList.vote.user2;
      setDPromise(res.data.voteList.vote.doPromise);
      console.log(res.data.voteList.fileId);
      processFileData(res.data.voteList.fileId);
      console.log(res.data);
      setPId(res.data.voteList.vote.postId);
      setIsApproved(res.data.voteList.vote.accept2);
      ccbbApi
        .get(`/vote/userPick?voteId=${res.data.voteList.vote.voteId}`, {
          headers,
        })
        .then((res) => {
          if (res.data.voteResult.userPick) {
            setUserPick(true);
          }
        })
        .catch((e) => {
          console.log(e);
        });
      ccbbApi
        .get(`/wod/check?postId=${res.data.voteList.vote.postId}`, { headers })
        .then((res) => {
          setIsWard(res.data.wodCheck);
          console.log(res);
        })
        .catch((e) => {
          console.log(e);
        });

      SetCurPost(res.data.voteList);

      fetchComments();
      // 현재 시간이 deadline을 지난지 확인
      const now = new Date();
      const deadline = new Date(res.data.voteList.vote.deadline);
      if (isAfter(now, deadline)) {
        fetchVoteResult(res.data.voteList.vote.voteId); // 투표 결과를 가져오는 함수 호출
        ccbbApi
          .get("/user/profile", { headers })
          .then((res) => {
            // user1이 이겼을때 승자를 user1으로 세팅
            setCurUser(res.data.user.userId);
            setUser1(user1);
            setUser2(user2);
            if (voteResult.pick1 > voteResult.pick2) {
              setWinner(user1);
              setLoser(user2);
            }
            // user2가 이겼을때 승자를 user2로 세팅
            else if (voteResult.pick1 < voteResult.pick2) {
              setWinner(user2);
              setLoser(user1);
            }
            console.log(res.data.user.userId);
            console.log(user1);
            console.log(user2);
            console.log(voteResult.pick1);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    });
  }, [userPick]);
  const now = new Date();
  const fetchVoteResult = (voteId) => {
    ccbbApi
      .get(`/vote/result`, {
        params: { voteId: voteId },
      })
      .then((res) => {
        console.log("voteResult response:", res.data); // 추가된 부분
        setVoteResult(res.data.voteResult); // 응답으로 받은 투표 결과를 상태 변수에 저장
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 두 번째 useEffect: curPost의 변경을 감지하여 타이머 업데이트
  useEffect(() => {
    const updateTimer = () => {
      if (curPost?.vote.deadline) {
        const deadline = new Date(curPost.vote.deadline);
        const now = new Date();

        // 현재 시간이 deadline을 지났는지 확인
        if (isAfter(now, deadline)) {
          const duration = intervalToDuration({ start: deadline, end: now });
          const timePassed = `${duration.days}일 ${duration.hours}시간 ${duration.minutes}분 지남`;
          setTimeLeft(timePassed);
        } else {
          const duration = intervalToDuration({ start: now, end: deadline });
          const timeLeft = `${duration.days}일 ${duration.hours}시간 ${duration.minutes}분 남음`;
          setTimeLeft(timeLeft);
        }
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [curPost]);

  const processFileData = (fileArray) => {
    for (const file of fileArray) {
      if (file.isPromise) {
        setPromiseFile({ hasPromise: true, fileType: file.type });
      }
    }
  };

  const isMyVote = () => {
    //(로그인한) 유저가 투표 당사자인지 체크
    return (
      userInfo?.userId === curPost?.vote.user1 ||
      userInfo?.userId === curPost?.vote.user2
    );
  };

  const voteStep = () => {
    //투표 진행단계를 0~3 중 하나의 숫자로 리턴함 (수락대기/투표진행/공약이행/보증금반환)
    if (!isApproved) return 0;
    const now = new Date();
    const endDate = new Date(curPost?.vote.deadline);
    if (isBefore(now, endDate)) return 1;
    if (!curPost?.vote.doPromise) return 2;
    return 3;
  };

  const fetchComments = () => {
    ccbbApi
      .get(`/comment/${postId}`)
      .then((res) => {
        SetComments(res.data.commentList);
      })
      .catch((e) => console.log(e));
  };

  const payresponse = () => {
    ccbbApi
      .post(
        `/payment/add?postId=${curPost.postId}&price=${curPost.vote.deposit}`,
        {},
        { headers }
      )
      .then((res) => {
        setPayment(res.data);
        openModalHandler();
      });
  };

  const voteReject = () => {
    if (window.confirm("정말 거절하시겠습니까? 게시글은 삭제됩니다.")) {
      ccbbApi
        .delete(`/post/reject/${curPost.postId}`, { headers }, {})
        .then((res) => {
          alert("거절하였습니다.");
          window.location.href = "https://ccbb.pro/lolvote";
        });
    }
  };

  // const toggleThumbUp = () => {
  //   setIsThumbup(!isThumbUp);
  // };

  // const toggleThumbDown = () => {
  //   setIsThumbDown(!isThumbDown);
  // };

  const toggleWard = () => {
    const headers = {
      Authorization: `Bearer ${token1}`,
    };
    // 와드를 했을경우
    if (isWard) {
      ccbbApi
        .delete(`/wod/delete/${pId}`, { headers })
        .then((res) => {
          console.log(res);
          setIsWard(!isWard);
        })
        .catch((e) => console.log(e));
    }
    // 와드를 안했을 경우
    else if (!isWard) {
      ccbbApi
        .post(`/wod/add?postId=${pId}`, {}, { headers })
        .then((res) => {
          console.log(res);
          setIsWard(!isWard);
        })
        .catch((e) => console.log(e));
    }
  };
  const togglePromisePage = () => {
    setIsPromisePageOpen(!isPromisePageOpen);
  };

  const [myComment, SetMyComment] = useState("");

  const handleOnKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && myComment) {
      e.preventDefault();
      postComment(); // Enter 입력시 댓글 등록
      e.target.value = "";
    }
  };

  const openModalHandler = () => {
    setIsOpen(!isOpen);
  };
  const handlevoteUser1 = (e) => {
    const headers = {
      Authorization: `Bearer ${token1}`,
    };
    const body = {
      ballotBoxId: 0,
      pick: 1,
      userId: 0,
      voteId: curPost.vote.voteId,
    };

    if (userPick) {
      alert("이미 투표를 하였습니다.");
      return;
    } else {
      ccbbApi.post("/vote/ballet/add", body, { headers }).then((e) => {
        console.log(e);
        setUserPick(true);
      });
    }
  };

  const openModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const voteSuccess = () => {
    // 기타 코드...
    openModal("투표가 성공적으로 이루어졌습니다.");
  };

  const handlevoteUser2 = (e) => {
    const headers = {
      Authorization: `Bearer ${token1}`,
    };
    const body = {
      ballotBoxId: 0,
      pick: 2,
      userId: 0,
      voteId: curPost.vote.voteId,
    };
    if (userPick) {
      alert("이미 투표를 하였습니다.");
      return;
    } else {
      ccbbApi.post("/vote/ballet/add", body, { headers }).then((e) => {
        console.log(e);
        setUserPick(true);
      });
    }
  };

  //댓글 전송
  const postComment = () => {
    ccbbApi
      .post(
        "/comment/add",
        JSON.stringify({ content: myComment, postId: postId }),
        { headers }
      )
      .then((res) => {
        SetMyComment("");
        fetchComments();
      })
      .catch((e) => console.log(e));
  };

  //댓글 수정
  const handleModifyComment = (commentId, newContent) => {
    console.log("댓글 수정");
    ccbbApi
      .put(
        "/comment/modify",
        JSON.stringify({
          commentId: commentId,
          content: newContent,
        }),
        { headers }
      )
      .then((res) => {
        fetchComments();
      })
      .catch((e) => console.log(e));
  };
  //댓글 삭제
  const handleDeleteComment = (commentId) => {
    ccbbApi
      .delete("/comment/delete", {
        headers,
        params: {
          commentId: commentId,
        },
      })
      .then((res) => {
        // console.log(res);
        fetchComments();
      })
      .catch((e) => console.log(e));
  };

  const handleCreateButtonClick = () => {
    setIsOpenModal(true);
  };

  const handleCancelClick = () => {
    setIsOpenModal(false);
  };

  const handleAgreeClick = () => {
    setIsOpenModal(false);
    payresponse();
  };
  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFile(files[0]);
  };

  const handleAcceptButton = () => {
    const headers = {
      Authorization: `Bearer ${token1}`,
    };
    console.log(token1);
    ccbbApi
      .post(
        `/post/promise/accept/${pId}`,
        {},
        {
          headers,
        }
      )
      .then((res) => {
        console.log(res);
        if (res.data === "공약 이행 완료") {
          setDPromise(true);
        }
      })
      .catch((e) => console.log(e));
  };
  const handleRefuseButton = () => {
    const headers = {
      Authorization: `Bearer ${token1}`,
    };
    console.log("거절");
    ccbbApi
      .post(
        `/file/remove/promise/${pId}`,
        {},
        {
          headers,
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((e) => console.log(e));
  };
  const handleUploadButton = async () => {
    const headers = {
      Authorization: `Bearer ${token1}`,
      "content-type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("file", selectedFile);
    console.log("Uploaded files:", selectedFile);

    try {
      const response = await axios.post(
        `https://ccbb.pro/api/file/add/promise/${pId}`,
        formData,
        {
          headers,
        }
      );

      // Handle the response
      console.log("Upload success:", response);
    } catch (error) {
      // Handle errors
      console.error("Upload error:", error);
    }
  };

  return (
    <S.Main>
      <S.Head>
        <S.Headtop>
          <Headermenu title={"리그 오브 레전드"} />
        </S.Headtop>
      </S.Head>
      <S.Votebodycover>
        <S.Menuhead>
          <S.HeadLeft>
            <S.Headtop>
              <Link to="/lolvote">
                <ArrowBackIosNewIcon style={{ padding: "5px" }} />
              </Link>
              <h1>{curPost.title}</h1>
            </S.Headtop>
            <S.Headbottom></S.Headbottom>
          </S.HeadLeft>
          <S.HeadRight>
            <TierImg tier={curPost.vote.limitTier} size={"100px"} />
          </S.HeadRight>
        </S.Menuhead>
        <S.TimeLeft>종료일 : {timeLeft}</S.TimeLeft>
        <S.DetailBody>
          {/* 투표 당사자일때만 진행상황이 보임 */}
          {isMyVote() && <VoteProcess step={voteStep()} />}
          <S.Moviebody>
            {curPost.fileId && curPost.fileId.length > 0 && (
              <ReactPlayer
                url={`https://ccbb.pro/api/file/get/${curPost.fileId[0].fileId}`}
                controls
                width="80%"
                height=""
                style={{
                  border: "3px solid #ccc",
                  borderRadius: "30px",
                  overflow: "hidden",
                }}
              />
            )}
          </S.Moviebody>
          <S.Votebody>
            {curPost.fileId && curPost.fileId.length > 1 && (
              <S.replaylinkBox>
                {curPost.fileId[1].extension === "bat" && (
                  <S.replaylink
                    href={`https://ccbb.pro/api/file/get/${curPost.fileId[1].fileId}`}
                    download
                  >
                    <DownloadIcon />
                    <p>리플레이파일</p>
                  </S.replaylink>
                )}
              </S.replaylinkBox>
            )}
            {curPost.content}
            <S.PromiseP>
              <h3 onClick={togglePromisePage}>공약</h3>
              {isPromisePageOpen ? (
                <ArrowDropDownIcon onClick={togglePromisePage} />
              ) : (
                <PlayArrowIcon onClick={togglePromisePage} />
              )}
            </S.PromiseP>

            <S.PromisePageWrapper $opened={isPromisePageOpen}>
              {curPost.vote.promise}
              {dPromise && <h3>공약 이행</h3>}

              {/* curPost.fileId 배열이 존재하고 최소 3개의 요소를 가지고 있을 때 파일 미리보기 부분을 렌더링하지 않음 */}
              {!promiseFile["hasPromise"] && (
                <>
                  <S.FilePreview>
                    {selectedFile && (
                      <>
                        {selectedFile.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            style={{ maxWidth: "100%", maxHeight: "200px" }}
                          />
                        ) : (
                          <video
                            key={URL.createObjectURL(selectedFile)} // Change the key here
                            controls
                            style={{ maxWidth: "100%", maxHeight: "200px" }}
                          >
                            <source
                              src={URL.createObjectURL(selectedFile)}
                              type={selectedFile.type}
                            />
                          </video>
                        )}
                      </>
                    )}
                  </S.FilePreview>
                  {/* 패자만 볼수있음 */}
                  {curUser === loser && (
                    <>
                      <input
                        type="file"
                        accept="image/*, video/*"
                        id="input-file"
                        onChange={handleFileChange}
                      />
                      <Button1
                        text={"등록"}
                        width={"55px"}
                        height={"30px"}
                        onClick={handleUploadButton}
                      ></Button1>
                    </>
                  )}
                </>
              )}

              {/* curPost.fileId 배열이 존재하고 최소 3개의 요소를 가지고 있을 때 동영상 부분을 렌더링함 */}
              {promiseFile["hasPromise"] && (
                <S.MPbody>
                  {promiseFile["fileType"].startsWith("image/") ? (
                    <img
                      src={`https://ccbb.pro/api/file/get/promise/${pId}`}
                      alt="Preview"
                      style={{ width: "80%", height: "40%" }}
                    />
                  ) : (
                    <ReactPlayer
                      url={`https://ccbb.pro/api/file/get/promise/${pId}`}
                      controls
                      width="80%"
                      height=""
                      style={{
                        border: "3px solid #ccc",
                        borderRadius: "30px",
                        overflow: "hidden",
                      }}
                    />
                  )}
                  {/* 승자만 볼수있음 */}
                  {!dPromise && curUser === winner && (
                    <S.ARWrapper>
                      <h1>공약을 이행했다고 생각하시나요?</h1>
                      <S.AWrapper>
                        <Button1
                          text={"O"}
                          width={"100px"}
                          height={"60px"}
                          onClick={handleAcceptButton}
                          size={"40px"}
                        />
                      </S.AWrapper>

                      <S.RWrapper>
                        <Button1
                          text={"X"}
                          width={"100px"}
                          height={"60px"}
                          onClick={handleRefuseButton}
                          color={"red"}
                          size={"40px"}
                        />
                      </S.RWrapper>
                    </S.ARWrapper>
                  )}
                </S.MPbody>
              )}
            </S.PromisePageWrapper>
            {isApproved ? (
              <S.VoteBodybot>
                <h3>{curPost.vote.argument}</h3>
                <h4>옳다고 생각하는 유저에 투표해주세요</h4>
                <S.Votebutton>
                  <S.ProfileBox
                    onClick={(e) => {
                      handlevoteUser1();
                    }}
                    $bgcolor="#97A7FF"
                  >
                    <UserProfile
                      imgUrl={`${process.env.REACT_APP_BASE_SERVER}profileimg/${curPost.vote.user1}`}
                      name={curPost.vote.nickname1}
                      color={"black"}
                    />
                  </S.ProfileBox>
                  <S.ImgVS
                    src="../resource/VSlogo.png"
                    alt="VS Logo"
                    style={{ height: "50px" }}
                  />
                  <S.ProfileBox
                    onClick={(e) => {
                      handlevoteUser2();
                    }}
                    $bgcolor="#FF9797"
                  >
                    <UserProfile
                      imgUrl={`${process.env.REACT_APP_BASE_SERVER}profileimg/${curPost.vote.user2}`}
                      name={curPost.vote.nickname2}
                      color={"black"}
                    />
                  </S.ProfileBox>
                </S.Votebutton>
                <br />
                <br />
                <h3>투표 결과</h3>
                <VoteRate />
                <S.VoteResultDisplay>
                  <S.Bar
                    color="#97A7FF"
                    $percent={`${
                      (voteResult.pick1 /
                        (voteResult.pick1 + voteResult.pick2 || 1)) *
                      100
                    }%`}
                  >
                    {/* deadline이 지난 경우에만 투표한 수 표시 */}
                    {new Date(curPost.vote.deadline) < now &&
                      `투표한 수 : ${voteResult.pick1}`}
                  </S.Bar>
                  <S.Bar
                    color="#FF9797"
                    $percent={`${
                      (voteResult.pick2 /
                        (voteResult.pick1 + voteResult.pick2 || 1)) *
                      100
                    }%`}
                  >
                    {/* deadline이 지난 경우에만 투표한 수 표시 */}
                    {new Date(curPost.vote.deadline) < now &&
                      `투표한 수 : ${voteResult.pick2}`}
                  </S.Bar>
                </S.VoteResultDisplay>
                <S.ArticleMenu>
                  {/* {isThumbUp ? (
                    <ThumbUpAltIcon
                      onClick={toggleThumbUp}
                      style={{ fontSize: "50px", cursor: "pointer" }}
                    />
                  ) : (
                    <ThumbUpOffAltIcon
                      onClick={toggleThumbUp}
                      style={{ fontSize: "50px", cursor: "pointer" }}
                    />
                  )} */}

                  {isWard ? (
                    <S.Imgward
                      onClick={toggleWard}
                      src="../resource/wardafter.png"
                      alt="VS Logo"
                      style={{ height: "80px", cursor: "pointer" }}
                    />
                  ) : (
                    <S.Imgward
                      onClick={toggleWard}
                      src="../resource/wardbefore.png"
                      alt="VS Logo"
                      style={{ height: "80px", cursor: "pointer" }}
                    />
                  )}

                  {/* {isThumbDown ? (
                    <ThumbDownAltIcon
                      onClick={toggleThumbDown}
                      style={{ fontSize: "50px", cursor: "pointer" }}
                    />
                  ) : (
                    <ThumbDownOffAltIcon
                      onClick={toggleThumbDown}
                      style={{ fontSize: "50px", cursor: "pointer" }}
                    />
                  )} */}
                </S.ArticleMenu>
              </S.VoteBodybot>
            ) : !isMyVote() ? (
              <S.VoteBodybot>
                <h3>{curPost.vote.argument}</h3>
                <h2>⛔️ 아직 성사되지 않은 게시글입니다. ⛔️</h2>
              </S.VoteBodybot>
            ) : (
              <S.VoteBodybot>
                <h3>{curPost.vote.argument}</h3>
                <h4>해당 투표를 진행하시겠습니까?</h4>
                <S.VoteBodyButtonBox>
                  <Button1
                    text="수락"
                    width="150px"
                    height="50px"
                    onClick={handleCreateButtonClick} // 변경된 부분: onClick 이벤트 핸들러로 payresponse 함수가 호출됩니다.
                  ></Button1>
                  <Button1
                    onClick={voteReject}
                    text="거절"
                    width="150px"
                    height="50px"
                    color="#8B0000"
                  ></Button1>
                </S.VoteBodyButtonBox>
                <VotePaymentModal
                  isOpen={isOpen}
                  onClose={openModalHandler}
                  payment={payment}
                />
              </S.VoteBodybot>
            )}
          </S.Votebody>

          {isApproved && (
            <S.BodyBottom>
              {token && (
                <S.Createcomment>
                  <InputComment
                    className="comment-input"
                    label="댓글작성"
                    id="댓글작성"
                    height="60px"
                    value={myComment}
                    btn={true}
                    onKeyPress={handleOnKeyPress}
                    onChange={(e) => {
                      SetMyComment(e.target.value);
                    }}
                    onClick={postComment}
                  />
                </S.Createcomment>
              )}

              <h4>
                댓글 {curPost && curPost.comment ? curPost.comment.length : 0}개
              </h4>
              <S.CommentBody>
                {/* <CommentBox
                  bgcolor="#97A7FF"
                  comment="This is a hard-coded sample comment"
                  userId="user123"
                  date="2023-10-31"
                /> */}
                {comments.map((cmt, index) => {
                  return (
                    <CommentBox
                      key={index}
                      isMine={userInfo.userId === cmt.userId}
                      userId={cmt.userId}
                      nickname={cmt.nickname}
                      comment={cmt.content}
                      date={cmt.createDate}
                      position={cmt.position}
                      onClickModify={(newContent) =>
                        handleModifyComment(cmt.commentId, newContent)
                      }
                      onClickDelete={() => handleDeleteComment(cmt.commentId)}
                    />
                  );
                })}
              </S.CommentBody>
            </S.BodyBottom>
          )}
        </S.DetailBody>
      </S.Votebodycover>
      {isModalOpen && (
        <S.DepositModal
          isOpen={isModalOpen}
          onClose={handleCancelClick}
          onAgree={handleAgreeClick}
        >
          공약을 이행하지 않으면 결제하신 보증금은 기부된다는 내용에
          동의하십니까?
        </S.DepositModal>
      )}
    </S.Main>
  );
}
