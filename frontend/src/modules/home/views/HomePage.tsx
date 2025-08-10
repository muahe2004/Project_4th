import { Box, Toolbar, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import homeThumb from "../../../assets/images/utehy2.jpg"
import { HomeCard } from "../components/HomeCard"
import "./styles/Home.css";
import Button from "../../../components/Button/Button";
import cardImage1 from "../../../assets/images/card-image1.jpg"
import cardImage2 from "../../../assets/images/card-image2.jpg"
import cardImage3 from "../../../assets/images/card-image3.jpg"

const mockCards = [
  {
    id: 1,
    image: cardImage1,
    title_vi: "Lorem ipsum Aliquid tempora voluptates",
    title_en: "Giving Community College Students a Textbook",
    time: "2025-09-05",
    desc_vi: "Lorem ipsum Aliquid tempora voluptates, incidunt repellendus consequatur quam.",
    desc_en: "English description for card 1..."
  },
  {
    id: 2,
    image: cardImage2,
    title_vi: "Lorem ipsum Aliquid tempora voluptates.",
    title_en: "Tuition Support Program for Poor Students",
    time: "2025-10-12",
    desc_vi: "Lorem ipsum Aliquid tempora voluptates, incidunt repellendus consequatur quam.",
    desc_en: "English description for card 2..."
  },
  {
    id: 3,
    image: cardImage3,
    title_vi: "CLorem ipsum dolor, sit amet consectetur adipisicing elit. Tenetur, sit. ",
    title_en: "Tuition Support Program for Poor Students",
    time: "2025-10-12",
    desc_vi: "Lorem ipsum Aliquid tempora voluptates, incidunt repellendus consequatur quam.",
    desc_en: "English description for card 2..."
  }
];

export function HomePage() {
  const { t } = useTranslation();
  
  return (
    <main className="home">
      <Box className="home-box">
        <img className="home-image" src={homeThumb}></img>

        <Box className="home-overlay"></Box>

        <Box className="home-box__absolute">
          <Typography className="home-box__typography">{t('home.homeMain.title1')}</Typography>
          <Typography className="home-box__typography">{t('home.homeMain.title2')}</Typography>
        </Box>
      </Box>

      <Box className="home-flex">
        {mockCards.map(card => (
            <HomeCard
              key={card.id}
              image={card.image}
              title={card.title_vi}
              time={card.time}
              desc={card.desc_vi}
            />
        ))}

        <Toolbar className="home-flex__toolbar">
          <Button className="home-flex__button">{t('home.homeNews.buttonMore')}</Button>
        </Toolbar>
      </Box>
    </main>
  );
}

export default HomePage;
