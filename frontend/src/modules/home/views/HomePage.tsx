import { Box, Toolbar } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import homeThumb from "../../../assets/images/utehy2.jpg"
import { HomeCard } from "../components/HomeCard"
import "./styles/Home.css";
import Button from "../../../components/Button/Button";
import { newsAndEventsUrl } from "../../../routes/urls";
import cardImage1 from "../../../assets/images/card-image1.jpg";
import cardImage2 from "../../../assets/images/card-image2.jpg";
import cardImage3 from "../../../assets/images/card-image3.jpg";
import cardImage4 from "../../../assets/images/card-image4.jpg";
import home1 from "../../../assets/images/home1.jpg";
import home4 from "../../../assets/images/home4.jpg";

const heroSlides = [homeThumb, home4, home1];

const mockCards = [
  {
    id: 1,
    image: cardImage1,
    title: "UTEHY công bố thông tin tuyển sinh đại học chính quy 2026",
    time: "2026-04-05",
    desc: "Năm 2026, Trường Đại học Sư phạm Kỹ thuật Hưng Yên tuyển sinh 3.895 chỉ tiêu với 29 ngành đào tạo và 4 phương thức xét tuyển."
  },
  {
    id: 2,
    image: cardImage2,
    title: "Thông tin kỳ thi đánh giá đầu vào đại học trên máy tính V-SAT 2026",
    time: "2026-04-01",
    desc: "Thí sinh có thể đăng ký tham dự kỳ thi V-SAT 2026 tại Trường Đại học Sư phạm Kỹ thuật Hưng Yên theo 2 đợt thi."
  },
  {
    id: 3,
    image: cardImage3,
    title: "Tự hào 30/4 - Vang mãi bản hùng ca dân tộc",
    time: "2026-04-30",
    desc: "UTEHY trang trọng kỷ niệm Ngày Giải phóng miền Nam 30/4, tri ân thế hệ đi trước và tiếp nối bằng tri thức."
  },
  {
    id: 4,
    image: cardImage4,
    title: "THÔNG BÁO NGHỈ LỄ",
    time: "2026-04-25",
    desc: "UTEHY thông báo lịch nghỉ Giỗ Tổ Hùng Vương, 30/4 và 1/5 tới toàn thể cán bộ, giảng viên và sinh viên."
  }
];

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoldingMouse, setIsHoldingMouse] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    if (isHoldingMouse) return;

    const intervalId = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isHoldingMouse]);

  const goToPreviousSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  const onMouseDownSlide = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsHoldingMouse(true);
    dragStartXRef.current = event.clientX;
    hasDraggedRef.current = false;
  };

  const onMouseMoveSlide = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoldingMouse || dragStartXRef.current === null || hasDraggedRef.current) return;

    const deltaX = event.clientX - dragStartXRef.current;
    const dragThreshold = 60;

    if (Math.abs(deltaX) < dragThreshold) return;

    if (deltaX > 0) {
      goToPreviousSlide();
    } else {
      goToNextSlide();
    }

    hasDraggedRef.current = true;
  };

  const stopMouseHold = () => {
    setIsHoldingMouse(false);
    dragStartXRef.current = null;
    hasDraggedRef.current = false;
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  
  return (
    <main className="home">
      <Box className="home-box" onMouseDown={onMouseDownSlide} onMouseMove={onMouseMoveSlide} onMouseUp={stopMouseHold} onMouseLeave={stopMouseHold}>
        <Box className="home-slider-track" sx={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroSlides.map((slide) => (
            <img
              key={slide}
              className="home-image"
              src={slide}
              alt="UTEHY hero"
              draggable={false}
            />
          ))}
        </Box>

        <Box className="home-slider-dots">
          {heroSlides.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className={`home-slider-dot ${index === currentSlide ? "is-active" : ""}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </Box>
      </Box>

      <Box className="home-flex">
        {mockCards.map(card => (
            <HomeCard
              key={card.id}
              image={card.image}
              title={card.title}
              time={formatDate(card.time)}
              desc={card.desc}
            />
        ))}

        <Toolbar className="home-flex__toolbar">
          <Button className="home-flex__button" onClick={() => navigate(newsAndEventsUrl)}>
            {t('home.homeNews.buttonMore')}
          </Button>
        </Toolbar>
      </Box>
    </main>
  );
}

export default HomePage;
