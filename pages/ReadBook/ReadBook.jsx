import { useEffect, useState, useRef } from "react";
import React from "react";
import ReactDOM from "react-dom";
import {
  Rating,
  Box,
  Typography,
  Button,
  Avatar,
  Breadcrumbs,
  Link,
  Grid,
  Divider,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import reviewApi from "../../apis/reviewApi";
import { mockData } from "../../apis/mockdata";
import { respond } from "../../components/SpeechRecognition/re";
import { tts } from "../../components/SpeechRecognition/re";
import { useLocation } from "react-router-dom";
import * as BookService from "../../services/BookService";
//test
import { setRecognizedText } from "../../redux/slice/speechSlice";
import HighlightText from "../../components/Highlight/HighlightText";
import "../../css/highlight.css";

let play = false;
let audio = null;

function ReadBook(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  var bookId = window.location.search.substring(1);
  const [book, setBook] = useState(mockData?.books[0]);
  const [text, setText] = useState("");
  //const [play, setPlay] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [audiob, setAudio] = useState([]);
  const [showMore, setShowMore] = useState(3);
  let recognizedText = useSelector((state) => state.speech.recognizedText);
  // Truy cập thông tin của chương từ props
  const location = useLocation();

  const chapterInfo = location.state?.chapterInfo;
  const bookInfo = location.state?.bookInfo;
  console.log("chuong o readbook", chapterInfo);
  console.log("bookInfo o readbook", bookInfo);

  //Biến cho phần highlight
  const [highlightIndex, setHighlightIndex] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  //Lấy dữ liệu time cho highlight
  useEffect(() => {
    if (chapterInfo) {
      setHighlightIndex(chapterInfo.time);
    }
  }, [chapterInfo]);

  // Hàm bắt đầu highlight
  const startHighlight = () => {
    setIsRunning(true);
  };

  // Hàm dừng highlight
  const stopHighlight = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const highlightText = () => {
    return text.split(" ").map((word, index) => (
      <span key={index} className={index < highlightIndex ? "highlight" : ""}>
        {word}{" "}
      </span>
    ));
  };

  // Hàm để render văn bản với highlight
  const renderTextWithHighlight = () => {
    return (
      <Typography
        variant="subtitle1"
        fontSize={{ xs: 24, sm: 26, md: 28 }}
        fontFamily={"revert-layer"}
        letterSpacing={1}
        lineHeight={2}
      >
        {highlightText()}
      </Typography>
    );
  };

  useEffect(() => {
    var urlaudio = "src/assets/book/" + chapterInfo.link;
    console.log("url", urlaudio);
    audio = new Audio(urlaudio);
  }, []);
  // Tạo một đối tượng âm thanh mới
  var urlaudio = "src/assets/book/" + chapterInfo.link;
  console.log("url", urlaudio);
  audio = new Audio(urlaudio);

  // Biến lưu giữ liệu cho nhận dạng
  window.audiocurrent = audio;
  audio.volume = 0.5;

  console.log("load");

  const handleBeforeOut = async (event) => {
    var chapter = findChapterById(bookInfo, chapterInfo._id);
    console.log("chapter can tim", chapter);
    chapter.time = audio.currentTime;
    // chapter.time = 0;
    console.log("chapter.time", chapter.time);
    console.log("currentTime", audio.currentTime);
    console.log("bookid232", bookInfo);
    audio.pause();
    play = false;

    try {
      const res1 = await BookService.updateProduct(bookInfo._id, bookInfo);
      if (res1?.status === "OK") {
        console.log("hh", res1.data);
      }
    } catch (error) {
      console.error("Failed to update book info", error);
    }
  };

  const CheckTimeAudio = () => {
    console.log("length", audio.duration);
    if (chapterInfo.time > 0) {
      audio.currentTime = chapterInfo.time;
      audio.play();
      console.log("check play 1");
    } else {
      audio.currentTime = 0;
      console.log("check play");
      audio.play();
    }
  };

  const TestFunction = () => {
    console.log("Test ok");
  };

  const ReadBegin = () => {
    console.log("đọc từ đầu");
    audio.currentTime = 0;
    audio.play();
  };

  const ReadContinue = () => {
    console.log("đọc tiếp");
    audio.currentTime = chapterInfo.time;
    audio.play();
  };

  const findChapterById = (bookObject, chapterId) => {
    // Lặp qua mảng 'Chuong'
    for (let i = 0; i < bookObject.chapter.length; i++) {
      console.log("lap", bookObject.chapter[i]);
      // So sánh ID của chương với chapterId cần tìm
      if (bookObject.chapter[i]._id === chapterId) {
        // Nếu tìm thấy, trả về đối tượng chương
        return bookObject.chapter[i];
      }
    }
    // Nếu không tìm thấy, trả về null hoặc thông báo lỗi tùy ý
    return null;
  };

  if (audio.paused === true) {
    // not playing
    console.log("sssss");
  } else if (audio.paused !== true) {
    // playing
    console.log("sssss11");
    //audio.pause();
  }

  const handleKeyDown = (event) => {
    if (event.key === "d") {
      console.log("dung doc", audio + audio.paused);
      // pauseAudio();

      if (!audio.paused) {
        console.log(audio.paused);
        audio.pause();
        //console.log(audio.paused);
      }
      stopHighlight();
    }
    if (event.key === "s") {
      // if (audio.paused !== true) {
      //   console.log("test");
      //   audio.play();
      // }
      audio.play();
      startHighlight();
    }
    if (event.key === "f") {
      console.log("set time");
      audio.currentTime = 100;
    }
    if (event.key === "g") {
      console.log(audio.currentTime);
      audio.volume;
    }
    if (event.key === "h") {
      handleBeforeOut();
    }
    if (event.key === "z") {
      //test
      dispatch(setRecognizedText("đọc tiếp"));
      recognizedText = "đọc tiếp";
      console.log("dung doc", recognizedText);
    }
  };

  // function pauseAudio() {
  //   audio.pause();
  // }
  function handleShowMoreClick() {
    setShowMore(showMore + 3);
  }
  function handleClickView() {}
  function handleClickAdd() {}

  useEffect(() => {
    //CheckTimeAudio();
    window.navigation.addEventListener("navigate", handleBeforeOut);
    //window.addEventListener("navigate", handleBeforeOut);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeOut);
    // window.addEventListener("hashchange", handleBeforeOut);
    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener("beforeunload", handleBeforeOut);
      window.navigation.removeEventListener("navigate", handleBeforeOut);
    };
  }, []);
  useEffect(() => {
    if (play === false) {
      respond("Bạn muốn đọc tiếp hay đọc lại từ đầu");
      play = true;
      console.log("kiểm tra", play);
    }
  }, []);

  useEffect(() => {
    if (recognizedText.toLocaleLowerCase().includes("đọc tiếp")) {
      ReadContinue();
    }
    if (recognizedText.toLocaleLowerCase().includes("đọc từ đầu")) {
      ReadBegin();
    }
    if (recognizedText.toLocaleLowerCase().includes("dừng")) {
      if (!audio.paused) {
        console.log(audio.paused);
        audio.pause();
        //console.log(audio.paused);
      }
    }
  }, [recognizedText]);

  // useEffect để quản lý interval khi isRunning thay đổi
  useEffect(() => {
    console.log("highlihgt");
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setHighlightIndex((prevIndex) => {
          if (prevIndex < text.length - 1) {
            return prevIndex + 1;
          } else {
            clearInterval(intervalRef.current);
            return prevIndex;
          }
        });
      }, 1000); // Highlight mỗi 500ms, bạn có thể thay đổi thời gian này
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, text.length]);

  return (
    <div>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#363636" : "#E6E6FA",
        }}
      >
        <Box
          sx={{
            width: { xs: "95%", sm: "80%" },
            height: "100%",
            overflow: "hidden",
            mt: 2,
          }}
        >
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Link underline="hover" color="inherit" href="/genre-detail">
              Danh sách
            </Link>
            <Link underline="hover" color="inherit" href="/book-detail">
              Thông tin sách
            </Link>
            <Typography color="text.primary">{chapterInfo?.name}</Typography>
          </Breadcrumbs>
          <Box>
            <Box gap={1} display={"flex"} flexDirection={"column"}>
              <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
                {bookInfo?.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Button
                  sx={{
                    color: "white",
                    ":hover": { bgcolor: "gray" },
                    bgcolor: "#1E90FF",
                  }}
                  onClick={handleClickView}
                >
                  Chương trước
                </Button>
                <Button
                  sx={{
                    bgcolor: "#1E90FF",
                    color: "white",
                    ":hover": { bgcolor: "gray" },
                  }}
                  onClick={handleClickAdd}
                >
                  Danh sách
                </Button>
                <Button
                  sx={{
                    bgcolor: "#1E90FF",
                    color: "white",
                    ":hover": { bgcolor: "gray" },
                  }}
                  onClick={handleClickAdd}
                >
                  Chương tiếp
                </Button>
              </Box>
              <Divider />
              <Box>
                <p>{renderTextWithHighlight()}</p>

                <Typography
                  variant="subtitle1"
                  fontSize={{ xs: 24, sm: 26, md: 28 }}
                  fontFamily={"revert-layer"}
                  letterSpacing={1}
                  lineHeight={2}
                >
                  Ngày 7 tháng 5 năm 1931, mười ngàn người ở chân thành Nữu Ước
                  (New York) được mục kích một cuộc săn người sôi nổi chưa từng
                  thấy. Một trăm năm mươi lính công an bao vây một căn phố để
                  bắt tên y cũng mang hai cây súng sáu trong mình. Họ leo lên
                  mái nhà chung quanh, dùng hơi cay và trong hơn một tiếng đồng
                  hồ, cả một khu mỹ lệ nhất của Nữu Ước vang lên tiếng súng và
                  tiếng "lạch tạch" của liên thinh. Crowley núp sau chiếc ghế
                  đệm bông, bắn lại lính không ngừng. Khi bắt được y rồi, viên
                  giám đốc công an tuyên bố: "Nó vào hạng tội nhân nguy hiểm
                  nhất. Nó muốn giết người là giết, không vì một lý do gì hết".
                  Nhưng còn chính tội nhân, Crowley, y tự xét y ra sao? Muốn
                  biét, bạn hãy đọc hàng sau này mà y vừa chống cự với lính vừa
                  viết để lại cho đời "Dưới lớp áp này, trái tim ta đập, chán
                  ngán, nhưng thương người, không muốn làm hại một ai hết".
                  Không muốn làm hại ai hết!Vậy mà trước đó mấy ngày, khi một
                  người lính công an lại gần y để hỏi y giấy phép lái xe hơi,
                  thì y xả ngay một loạt súng, giết người đó tức thì. Một kẻ sát
                  nhân không gớm máu như vậy mà còn tự khoe: "Trái tim thương
                  người, không muốn làm hại một ai hết!". Trước khi lên ngồi ghế
                  điện để chịu tử hình tại khám Sing Sing, y còn than: "Tôi chỉ
                  tự vệ mà người ta xử tôi như vậy đó". Nghĩa là trong thâm tâm
                  y, y nhất định không chịu nhận y có tội. Bạn sẽ nói: "Thì chỉ
                  có nó nghĩ thế, chứ còn ai lạ đời như vậy nữa". Không đâu,
                  thưa bạn: kẻ thù số một của nước Mỹ. Al Copone, tên đầu đảng
                  ăn cướp đã làm cho châu thành Chicago kinh khủng, cũng nói:
                  "Ta đã dùng những năm tươi đẹp nhất trong đời ta để mua vui
                  cho thiên hạ, vậy mà phần thưởng chỉ là bị chửi và bị săn bắn
                  như con thú dữ". Mà cả Dutch Schluts, một trong những tên cướp
                  lợi hại nhất ở Nữu Ước cũng tuyên bố với một ký giả rằng y là
                  ân nhân của thiên hạ. Viên Giám đốc khám Sing Sing, ông Lawes,
                  viết "ở Sing Sing, những tội nhân đều tự cho họ cũng có tâm
                  trạng thong thường khác đời chi hết. Cũng lý luận, giảng giải,
                  tại sao chúng bị bắt buộc phải cạy tủ sắt hoặc bóp cò... và
                  tuyến bố rằng bỏ tù chúng thật là bất công". Nếu ba tên cướp
                  đó và bọn khốn nạn đường nằm trong khám, tự cho mình vô tội
                  như vậy thì những người mà chúng ta gặp mỗi ngày, ở ngoài
                  đường, cả các bạn nữa, cả tôi nữa, chúng ta ra sao? Cho nên
                  ông John Wannamaker, một thương gia lớn, có lần đã tự thú: "Từ
                  30 năm nay, tôi đã hiểu rằng: sự chỉ trích chẳng ích lợi gì
                  hết". ÔNg đã sớm hiểu bài học đó. Riêng tôi, tôi đã phải phấn
                  đấu trong một phần ba thế kỷ trước khi thấy ló ra ánh sáng của
                  chân lý này; "Dù người ta có lỗi nặng tới đâu, thì trong 100
                  lần, có tới 99 lần người ta cũng tự cho là vô tội".
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Button
                  sx={{
                    color: "white",
                    ":hover": { bgcolor: "gray" },
                    bgcolor: "#1E90FF",
                  }}
                  onClick={handleClickView}
                >
                  Chương trước
                </Button>
                <Button
                  sx={{
                    bgcolor: "#1E90FF",
                    color: "white",
                    ":hover": { bgcolor: "gray" },
                  }}
                  onClick={handleClickAdd}
                >
                  Danh sách
                </Button>
                <Button
                  sx={{
                    bgcolor: "#1E90FF",
                    color: "white",
                    ":hover": { bgcolor: "gray" },
                  }}
                  onClick={handleClickAdd}
                >
                  Chương tiếp
                </Button>
              </Box>
            </Box>
            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography variant="h5" fontWeight={"bold"}>
                Bình luận và đánh giá
              </Typography>
              {reviews?.slice(0, showMore).map((review, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    borderRadius: 3,
                    width: "100%",
                    gap: 2,
                    alignItems: "center",
                    mt: 3,
                  }}
                >
                  <Avatar>{review?.customerId}</Avatar>
                  <Box sx={{}}>
                    <Typography variant="subtitle1">
                      User {review?.customerId}
                    </Typography>
                    <Typography variant="body1">{review?.comment}</Typography>
                  </Box>
                </Box>
              ))}
              {reviews.length > showMore && (
                <Button
                  onClick={handleShowMoreClick}
                  sx={{ color: "gray", "&:hover": { bgcolor: "darkgray" } }}
                >
                  Show More
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <div></div>
    </div>
  );
}

export default ReadBook;
