import { Box, Typography } from "@mui/material";
import "./styles/HomeCard.css";

interface HomeCardProps {
  image: string;
  title: string;
  time: string;
  desc: string;
}

export function HomeCard({ image, title, time, desc }: HomeCardProps) {
  return (
    <Box className="home-card">
      <Box className="home-card__box">
        <img className="home-card__image" src={image} alt={title} />
      </Box>

      <Typography className="home-card__title">{title}</Typography>
      <Typography className="home-card__time">{time}</Typography>
      <Typography className="home-card__desc">{desc}</Typography>
    </Box>
  );
}
