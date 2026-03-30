// import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
// import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
// import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
// import ScheduleIcon from "@mui/icons-material/Schedule";

// import { getStatusColor } from "../../../utils/status/status-color";
// import { getStatusDisplay } from "../../../utils/status/status-display";
// import "./styles/ExaminationBox.css";

// interface ExaminationBoxProps {
//   title: string;
//   classText: string;
//   timeText: string;
//   roomText?: string;
//   invigilatorText?: string;
//   status?: string | null;
// }

// export function ExaminationBox({
//   title,
//   classText,
//   timeText,
//   roomText,
//   invigilatorText,
//   status,
// }: ExaminationBoxProps) {
//   return (
//     <article className="examination-box">
//       <h4 className="examination-box__title">{title}</h4>
//       <div className="examination-box__row">
//         <EventNoteOutlinedIcon className="examination-box__icon" />
//         <span>{classText}</span>
//       </div>
//       <div className="examination-box__row">
//         <ScheduleIcon className="examination-box__icon" />
//         <span className="examination-box__time">{timeText}</span>
//       </div>
//       {roomText && (
//         <div className="examination-box__row">
//           <LocationOnOutlinedIcon className="examination-box__icon" />
//           <span className="examination-box__room">{roomText}</span>
//         </div>
//       )}
//       {invigilatorText && (
//         <div className="examination-box__row">
//           <PersonOutlineOutlinedIcon className="examination-box__icon" />
//           <span>{invigilatorText}</span>
//         </div>
//       )}
//       {status && (
//         <div
//           className="examination-box__status"
//           style={{ color: getStatusColor(status) }}
//         >
//           {getStatusDisplay(status)}
//         </div>
//       )}
//     </article>
//   );
// }

// export default ExaminationBox;
