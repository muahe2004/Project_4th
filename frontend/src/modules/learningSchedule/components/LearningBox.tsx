import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import "./styles/LearningBox.css";

interface LearningBoxProps {
  title: string;
  periodText: string;
  timeText: string;
  roomText?: string;
  teacherText?: string;
}

export function LearningBox({
  title,
  periodText,
  timeText,
  roomText,
  teacherText,
}: LearningBoxProps) {
  return (
    <article className="learning-box">
      <h4 className="learning-box__title">{title}</h4>
      <div className="learning-box__row">
        <EventNoteOutlinedIcon className="learning-box__icon" />
        <span>{periodText}</span>
        <span className="learning-box__time">{timeText}</span>
      </div>
      {roomText && (
        <div className="learning-box__row">
          <LocationOnOutlinedIcon className="learning-box__icon" />
          <span className="learning-box__room">{roomText}</span>
        </div>
      )}
      {teacherText && (
        <div className="learning-box__row">
          <PersonOutlineOutlinedIcon className="learning-box__icon" />
          <span>{teacherText}</span>
        </div>
      )}
    </article>
  );
}

export default LearningBox;
