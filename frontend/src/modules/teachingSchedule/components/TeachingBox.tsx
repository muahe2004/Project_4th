import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import "../../learningSchedule/components/styles/LearningBox.css";

interface TeachingBoxProps {
  title: string;
  periodText: string;
  timeText: string;
  roomText?: string;
  classText?: string;
}

export function TeachingBox({
  title,
  periodText,
  timeText,
  roomText,
  classText,
}: TeachingBoxProps) {
  return (
    <article className="learning-box">
      <h4 className="learning-box__title">{title}</h4>
      <div className="learning-box__row">
        <EventNoteOutlinedIcon className="learning-box__icon" />
        <span>{periodText}</span>
        <span className="learning-box__time">{timeText}</span>
      </div>
      {classText && (
        <div className="learning-box__row">
          <SchoolOutlinedIcon className="learning-box__icon" />
          <span>{classText}</span>
        </div>
      )}
      {roomText && (
        <div className="learning-box__row">
          <LocationOnOutlinedIcon className="learning-box__icon" />
          <span className="learning-box__room">{roomText}</span>
        </div>
      )}
    </article>
  );
}

export default TeachingBox;
